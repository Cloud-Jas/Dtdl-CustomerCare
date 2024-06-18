require('dotenv').config();
const { MongoClient } = require('mongodb');
const { AgentExecutor } = require("langchain/agents");
const { OpenAIFunctionsAgentOutputParser } = require("langchain/agents/openai/output_parser");
const { formatToOpenAIFunctionMessages } = require("langchain/agents/format_scratchpad");
const { DynamicTool } = require("@langchain/core/tools");
const { RunnableSequence } = require("@langchain/core/runnables");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { MessagesPlaceholder, ChatPromptTemplate } = require("@langchain/core/prompts");
const { convertToOpenAIFunction } = require("@langchain/core/utils/function_calling");
const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { AzureCosmosDBVectorStore } = require("@langchain/community/vectorstores/azure_cosmosdb");
const { HttpResponseOutputParser } = require('langchain/output_parsers');
const crypto = require('crypto');
const twilio = require('twilio');

class DtdlCustomerCareAIAgent {
    constructor(sessionId) {
        // set up the MongoDB client
        this.dbClient = new MongoClient(process.env.AZURE_COSMOSDB_CONNECTION_STRING);
        // set up the Azure Cosmos DB vector store
        const azureCosmosDBConfig = {
            client: this.dbClient,
            databaseName: "dtdl-customercare",
            collectionName: "products",
            indexName: "VectorSearchIndex",
            embeddingKey: "contentVector",
            textKey: "_id"
        }

        const kbCosmosDBConfig = {
            client: this.dbClient,
            databaseName: "dtdl-customercare",
            collectionName: "knowledgebase",
            indexName: "KbSearchIndex",
            embeddingKey: "embeddingvector",
            textKey: "_id"
        }
        const OTP_EXPIRATION_TIME = 5 * 60 * 1000; // 5 minutes

        this.vectorStore = new AzureCosmosDBVectorStore(new OpenAIEmbeddings(), azureCosmosDBConfig);
        this.kbVectorStore = new AzureCosmosDBVectorStore(new OpenAIEmbeddings(), kbCosmosDBConfig);
        this.twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

        // set up the OpenAI chat model
        // https://js.langchain.com/docs/integrations/chat/azure
        this.chatModel = new ChatOpenAI({
            temperature: 0,
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
        });

        // initialize the chat history
        this.chatHistory = [];

        this.sessionId = sessionId;

        // initialize the agent executor
        (async () => {
            this.agentExecutor = await this.buildAgentExecutor();
        })();

        (async () => {
            this.summarizingAgent = await this.buildSummarizingAgent();
        })();
    }

    async formatDocuments(docs) {
        // Prepares the product list for the system prompt.  
        let strDocs = "";
        for (let index = 0; index < docs.length; index++) {
            let doc = docs[index];
            let docFormatted = { "_id": doc.pageContent };
            Object.assign(docFormatted, doc.metadata);

            // Build the product document without the contentVector and tags
            if ("contentVector" in docFormatted) {
                delete docFormatted["contentVector"];
            }
            if ("embeddingvector" in docFormatted) {
                delete docFormatted["embeddingvector"];
            }
            if ("tags" in docFormatted) {
                delete docFormatted["tags"];
            }

            // Add the formatted product document to the list
            strDocs += JSON.stringify(docFormatted, null, '\t');

            // Add a comma and newline after each item except the last
            if (index < docs.length - 1) {
                strDocs += ",\n";
            }
        }
        // Add two newlines after the last item
        strDocs += "\n\n";
        return strDocs;
    }

    async buildSummarizingAgent()
    {
        const systemSummarizationMessage = `
        
        You are a helpful assistant for Deutsche Telekom's customer care assistant.

        You are designed to Summarize conversation between User and Assitant

        Provide What are the highlights on the conversation between User and Assitant and if required Follow up actions

        `

        const dummyTool = new DynamicTool({
            name: "dummy_tool",
            description: `Don't call this function, this is a dummy tool`,
            func: async (input) => {
                return input;
            },
        });

        const tools = [dummyTool];

        const modelWithFunctions = this.chatModel.bind({
            functions: tools.map((tool) => convertToOpenAIFunction(tool)),
        });

        const summarizationPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemSummarizationMessage],
            ["human", "{input}"]
        ]);  

        const runnableAgent = RunnableSequence.from([
            {
                input: (i) => i.input,
                agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps)
            },
            summarizationPrompt,
            modelWithFunctions,
            new OpenAIFunctionsAgentOutputParser(),
        ]);

       

        const executor = AgentExecutor.fromAgentAndTools({
            agent: runnableAgent,
            tools,
            returnIntermediateSteps: true
        });

        return executor;     
    }


    async buildAgentExecutor() {
        // A system prompt describes the responsibilities, instructions, and persona of the AI.
        // Note the variable placeholders for the list of products and the incoming question are not included.
        // An agent system prompt contains only the persona and instructions for the AI.
        const systemMessage = `
        You are a friendly, helpful, and fun customer care assistant for Deutsche Telekom, a telecommunications company offering mobile, internet, and TV services.
        
        Your role is to answer questions related to Deutsche Telekom's products and services, their customers, and service orders placed by customers.
        
        To better understand and assist with customer needs, ask follow-up questions when appropriate.
        
        If you don't know the answer to a question, simply respond with "I don't know."
        
        Respond only to questions about Deutsche Telekom's products, services, customers, and service orders.
        
        After addressing a question, feel free to ask if the customer needs help with anything else.

        For general inquiries follow below process:

        1. If the inquiry is about any general queries , use faq_retriever_tool to fetch the relevant answers. If the retreived Json is empty respond with "I don't know".
        2. If the inquiry is about the product, use products_retriever_tool to fetch relevant answers. If the retreived Json is empty respond with "I don't know".
        3. If the inquiry is about any specific product sku, use product_sku_lookup_tool to fetch the exact answer
        4. If you don't find any answer , simply respond with "I don't know."
        
        For inquiries about any specific order, follow below process:
        
        1. Ask for the customer's phone number: "Could you please provide your phone number, so we can authorize?"
        
        2. Upon receiving the number if valid, say: "Thank you for sharing your number. You will receive an OTP in a moment. Please input it to proceed further." else any error say: "Thank you for sharing your number. However we are currently facing some issues, please try again later."

        3. Now make a call to otp_generation_tool provided in your tools to generate OTP
        
        4. If they provide the OTP make a call to otp_validation_tool for validating the OTP against phone number and it's expiration, respond with either: "Thank you for choosing Deutsche Telekom" if authorized, or "Sorry, we couldn't authorize you. Please enter a valid OTP" if not authorized.

        5. If it is a valid OTP make a call to specific_order_tool for fetching information about a Order given it's ID and phonenumber        

        For inquiries about any past orders, follow below process:
        
        1. Ask for the customer's phone number: "Could you please provide your phone number, so we can authorize?"
        
        2. Upon receiving the number if valid, say: "Thank you for sharing your number. You will receive an OTP in a moment. Please input it to proceed further." else any error say: "Thank you for sharing your number. However we are currently facing some issues, please try again later."

        3. Now make a call to otp_generation_tool provided in your tools to generate OTP
        
        4. If they provide the OTP make a call to otp_validation_tool for validating the OTP against phone number and it's expiration, respond with either: "Thank you for choosing Deutsche Telekom" if authorized, or "Sorry, we couldn't authorize you. Please enter a valid OTP" if not authorized.

        5. If it is a valid OTP make a call to past_orders_tool for fetching information about all past orders of a customer based on phonenumber        

        Don't ask for successive OTP verification if it is already validated before.
        
        If a question is not related to Deutsche Telekom's products, services, customers, or service orders, respond with "I only answer questions about Deutsche Telekom".
        `;       

        // Create vector store retriever chain to retrieve documents and formats them as a string for the prompt.
        const retrieverChain = this.vectorStore.asRetriever().pipe(this.formatDocuments);
        const kbRetrieverChain = this.kbVectorStore.asRetriever().pipe(this.formatDocuments);

        // Define tools for the agent can use, the description is important this is what the AI will 
        // use to decide which tool to use.

        // A tool that retrieves product information from Dtdl Customer Care based on the user's question.
        const productsRetrieverTool = new DynamicTool({
            name: "products_retriever_tool",
            description: `Searches DTDL customercare product information for similar products based on the question. 
                    Returns the product information in JSON format.`,
            func: async (input) => await retrieverChain.invoke(input),
        });

        const faqsRetrieverTool = new DynamicTool({
            name: "faq_retriever_tool",
            description: `Searches DTDL knowledgebase for similar information based on the question. 
                    Returns the Faq (knowledgebase) information in JSON format.`,
            func: async (input) => await kbRetrieverChain.invoke(input),
        });

        // A tool that will lookup a product by its SKU. Note that this is not a vector store lookup.
        const productLookupTool = new DynamicTool({
            name: "product_sku_lookup_tool",
            description: `Searches DTDL customercare product information for a single product by its SKU.
                    Returns the product information in JSON format.
                    If the product is not found, returns null.`,
            func: async (input) => {
                const db = this.dbClient.db("dtdl-customercare");
                const products = db.collection("products");
                const doc = await products.findOne({ "sku": input });
                if (doc) {
                    //remove the contentVector property to save on tokens
                    delete doc.contentVector;
                }
                return doc ? JSON.stringify(doc, null, '\t') : null;
            },
        });

        const customerSpecificOrderTool = new DynamicTool({
            name: "specific_order_tool",
            description: `Fetches a specific order item based on the customer's phone number and order ID. Returns the order item as a JSON string.`,
            func: async (input) => {
                // Split the input to get phone number and order ID
                const [phoneNumber, orderId] = input.split(',');
        
                if (!phoneNumber || !orderId) {
                    throw new Error("Invalid input format. Expected 'phoneNumber,orderId'");
                }
        
                // Connect to the database
                const db = this.dbClient.db("dtdl-customercare");
                const customers = db.collection("customers");
                const sales = db.collection("sales");
        
                // Fetch the customer entry for the given phone number
                const customer = await customers.findOne({ "phoneNumber": phoneNumber.trim() });
        
                if (!customer) {
                    throw new Error("Customer not found");
                }
        
                // Fetch the specific order for the customer using the customer ID and order ID
                const customerId = customer.customerId;
                const order = await sales.findOne({ "customerId":customerId, "_id": orderId.trim() });
        
                if (!order) {
                    throw new Error("Order not found");
                }
        
                // Convert the order data to a JSON string
                return JSON.stringify(order, null, '\t');
            },
        });
        
        
        const customerPastOrdersTool = new DynamicTool({
            name: "past_orders_tool",
            description: `Fetches a customer's past orders based on their phone number once OTP is validated. Returns the orders as a JSON string.`,
            func: async (input) => {
                // Split the input to get phone number
                const phoneNumber = input.trim();
        
                if (!phoneNumber) {
                    throw new Error("Invalid input format. Expected a phone number");
                }
        
                // Connect to the database
                const db = this.dbClient.db("dtdl-customercare");
                const customers = db.collection("customers");
                const sales = db.collection("sales");
        
                // Fetch the customer entry for the given phone number
                const customer = await customers.findOne({ "phoneNumber":phoneNumber });
        
                if (!customer) {
                    throw new Error("Customer not found");
                }
        
                // Fetch all sales for the customer using the customer ID
                const customerId = customer.customerId;
                const customerSales = await sales.find({ "customerId":customerId }).toArray();
        
                // Convert the sales data to a JSON string
                return JSON.stringify(customerSales, null, '\t');
            },
        });
        

        const otpGenerationTool = new DynamicTool({
            name: "otp_generation_tool",
            description: `Generates and sends an OTP with the provided user's phone.`,
            func: async (input) => {                               
                const OTP_EXPIRATION_TIME = 5 * 60 * 1000;       
                const otp = crypto.randomInt(100000, 999999).toString();
                const expiresAt = Date.now() + OTP_EXPIRATION_TIME;

                const db = this.dbClient.db("dtdl-customercare");
                const otps = db.collection("otps");

                await otps.insertOne({ input, otp, expiresAt });

                    try {
                        await this.twilioClient.messages.create({
                            body: `Your OTP code is ${otp}`,
                            from: process.env.TWILIO_PHONE_NUMBER,
                            to: input
                        });
                    } catch (error) {
                        console.error('Error sending OTP:', error);
                        return "OTP send is failed";
                    }
                    return "OTP is sent successfully";
                }                
        });
        
        const otpValidationTool = new DynamicTool({
            name: "otp_validation_tool",
            description: `Validates an OTP for the user by its phonenumber and OTP. Input should be formatted as comma separated values. Returns true if valid, otherwise throws an error.`,
            func: async (input) => {
                const [phoneNumber, otp] = input.split(',');
                if (!phoneNumber || !otp) {
                    throw new Error('Phone number and OTP are required');
                }
        
                const db = this.dbClient.db("dtdl-customercare");
                const otps = db.collection("otps");
        
                const otpEntry = await otps.findOne({"input": phoneNumber, "otp":otp });
        
                if (!otpEntry) {
                    return 'Invalid OTP';
                }
        
                if (Date.now() > otpEntry.expiresAt) {
                    return 'OTP expired';
                }        
                return "OTP is valid";
            }
        });
        
        // Generate OpenAI function metadata to provide to the LLM
        // The LLM will use this metadata to decide which tool to use based on the description.
        const tools = [productsRetrieverTool, faqsRetrieverTool,productLookupTool,otpGenerationTool,otpValidationTool,customerPastOrdersTool,customerSpecificOrderTool];
        const modelWithFunctions = this.chatModel.bind({
            functions: tools.map((tool) => convertToOpenAIFunction(tool)),
        });

        // OpenAI function calling is fine-tuned for tool using therefore you don't need to provide instruction.
        // All that is required is that there be two variables: `input` and `agent_scratchpad`.
        // Input represents the user prompt and agent_scratchpad acts as a log of tool invocations and outputs.
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemMessage],
            new MessagesPlaceholder("chat_history"),
            ["human", "{input}"],
            new MessagesPlaceholder("agent_scratchpad")
        ]);      

        // Define the agent and executor
        // An agent is a type of chain that reasons over the input prompt and has the ability
        // to decide which function(s) (tools) to use and parses the output of the functions.
        const runnableAgent = RunnableSequence.from([
            {
                input: (i) => i.input,
                agent_scratchpad: (i) => formatToOpenAIFunctionMessages(i.steps),
                chat_history: (i) => i.chat_history
            },
            prompt,
            modelWithFunctions,
            new OpenAIFunctionsAgentOutputParser(),
        ]);

        // An agent executor can be thought of as a runtime, it orchestrates the actions of the agent
        // until completed. This can be the result of a single or multiple actions (one can feed into the next).
        // Note: If you wish to see verbose output of the tool usage of the agent, 
        //       set returnIntermediateSteps to true
        const executor = AgentExecutor.fromAgentAndTools({
            agent: runnableAgent,
            tools,
            returnIntermediateSteps: true
        });

        return executor;
    }

    // Helper function that executes the agent with user input and returns the string output
    async executeAgent(input) {
        let returnValue = "";
        try {
            await this.dbClient.connect();
            // Invoke the agent with the user input
            const result = await this.agentExecutor.invoke({ input: input, chat_history: this.chatHistory });

            this.chatHistory.push(new HumanMessage(input));
            this.chatHistory.push(new AIMessage(result.output));

            await this.saveChatHistory(input, result.output);

            // Output the intermediate steps of the agent if returnIntermediateSteps is set to true
            if (this.agentExecutor.returnIntermediateSteps) {
                console.log(JSON.stringify(result.intermediateSteps, null, 2));
            }
            // Return the final response from the agent
            returnValue = result.output;
        } finally {
            await this.dbClient.close();
        }
        return returnValue;
    }
    async saveChatHistory(userInput, aiOutput) {
        const db = this.dbClient.db("dtdl-customercare");
        const chatHistoryCollection = db.collection("chatHistory");

        const chatDocument = {
            sessionId: this.sessionId,
            userInput: `user: ${userInput}`,
            aiOutput: `assistant: ${aiOutput}`,
            timestamp: new Date()
        };

        await chatHistoryCollection.insertOne(chatDocument);
    }

    async getSummary(){
    let summarizedSummary ="";
    try {
        await this.dbClient.connect();
        
        const db = this.dbClient.db("dtdl-customercare");
        
        const sessionId = this.sessionId;

        const chatHistory = await db.collection('chatHistory').find({ sessionId: sessionId }).sort({ timestamp: 1 }).toArray();
        
        const summary = chatHistory.map(chat => `${chat.userInput}\n${chat.aiOutput}`).join('\n');

        const result = await this.summarizingAgent.invoke({ input: summary});

        summarizedSummary = result.output;
        
        return summarizedSummary;

        } 
        finally {
            await this.dbClient.close();
        }
        return summarizedSummary;
    }
    async clearChatHistory() {
        try {
            await this.dbClient.connect();
            const db = this.dbClient.db("dtdl-customercare");
            const chatHistoryCollection = db.collection("chatHistory");
            await chatHistoryCollection.deleteMany({ sessionId: this.sessionId });
        } finally {
            await this.dbClient.close();
        }
    }
};

module.exports = DtdlCustomerCareAIAgent;
