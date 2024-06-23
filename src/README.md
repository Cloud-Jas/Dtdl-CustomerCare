## Langchain Agents

Langchain is a open-source framework that simplifies the development of LLM applications. It is all about having set of tools and abstractions that makes it easy to integrate LLM into your workflows, connect them to external data sources and build complex applciations.

<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/372d9ry1rx7ptzezagk6.png" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/372d9ry1rx7ptzezagk6.png">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/372d9ry1rx7ptzezagk6.png" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/372d9ry1rx7ptzezagk6.png" width="1000">
 </a>

Langchain Agents are key component of the framework enabling LLMs to acts as reasoning engines. Agents use LLM to determine the best course of action based on user input and available tools. This helps us to build autonomous applications.

For more info visit <a href="https://python.langchain.com/v0.1/docs/modules/agents/concepts/">here</a>


## Function calling

<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zslgm89bs2k2jc8wfts7.gif" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zslgm89bs2k2jc8wfts7.gif">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zslgm89bs2k2jc8wfts7.gif" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zslgm89bs2k2jc8wfts7.gif" width="1700">
 </a>


Latest version of GPT models are fine-tuned to understand and work with functions and have the reasoning engine to enable LLM to decide when and how a function should be called. Say for example if there are more than one function included in the request, model determines which to call based on the context of the prompt.

This allows us to connect with external data source and bring in more context to the LLM securely.

### Customer query on products


<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zwduwxjk96yfe1idz9vt.png" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zwduwxjk96yfe1idz9vt.png">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zwduwxjk96yfe1idz9vt.png" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zwduwxjk96yfe1idz9vt.png" width="1700">
 </a>

- When a user asks a product-related query, such as "Can you compare the various TV packages available?", the system begins processing the request.
- Along with the user's prompt, a list of available tools is sent to the Language Learning Model (LLM).
- LLM decides to pick Products_retriever_tool 
- Then LLM recognizes the need to generate vector embeddings for the query, and these embeddings are sent back to the application.
- The generated embeddings are used to perform a vector search against Azure Cosmos DB to retrieve relevant product information from the database.
- The retrieved documents are then sent back to the LLM.
- The LLM responds to the user, providing information based on the query and the relevant data fetched from the database.

<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yd7ms9fjoinyjawvdt6s.png" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yd7ms9fjoinyjawvdt6s.png">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yd7ms9fjoinyjawvdt6s.png" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/yd7ms9fjoinyjawvdt6s.png" width="1700">
 </a>


```ts
        const productsRetrieverTool = new DynamicTool({
            name: "products_retriever_tool",
            description: `Searches DTDL customercare product information for similar products based on the question. 
                    Returns the product information in JSON format.`,
            func: async (input) => await retrieverChain.invoke(input),
        });       
```


### Customer query on their past specific order



<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mvgpholwo649acag5omn.gif" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mvgpholwo649acag5omn.gif">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mvgpholwo649acag5omn.gif" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mvgpholwo649acag5omn.gif" width="1700">
 </a>

- The user initiates the process by prompting the system with a query related to their past order, specifying the order ID. This prompt sets the stage for retrieving personal order information.

- Along with the user's query, the system sends a list of available tools to the Language Learning Model (LLM). This list helps the LLM determine which actions to take next based on the user's request.

- Recognizing that the query involves sensitive personal information, the LLM understands from the system prompt that authentication is necessary to proceed. This step ensures that only the rightful user can access their order details.

- To authenticate the user, the LLM asks the customer to provide their phone number. This is a crucial step for initiating the verification process.

- The user then provides their phone number, which the system will use to send an OTP (One-Time Password) for verification purposes.

- The provided phone number, along with the list of available tools, is sent back to the LLM. This allows the LLM to make an informed decision on which tool to use next.

<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2j4un6aab44wfedfm4yq.png" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2j4un6aab44wfedfm4yq.png">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2j4un6aab44wfedfm4yq.png" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/2j4un6aab44wfedfm4yq.png" width="1700">
 </a>



- The LLM selects the otp_generation_tool for user authentication and passes the phone number as a parameter to this tool. This tool is responsible for generating the OTP.

- The otp_generation_tool generates an OTP and sends it to the user's phone number via the Twilio SMS API. It also stores the OTP in the database alongside the phone number for later verification.

- Twilio sends the OTP to the customer’s phone number via SMS. This step ensures that the user receives the OTP promptly.

- The customer receives the OTP and inputs it into the chatbot. This input is necessary for verifying their identity.

- The entered OTP, along with the previous chat history and the list of available tools, is sent back to the LLM. This allows the LLM to decide on the next action based on the current context.

- The LLM then selects the otp_verification_tool to validate the OTP. It passes both the phone number and the OTP as parameters to this function. The verification tool checks if the provided OTP matches the one stored in the database.

- The otp_verification_tool verifies the OTP against the stored information. If the OTP is valid, the LLM proceeds to retrieve the user's order details.

- To fetch the order details, the LLM uses the specific_order_tool, providing the phone number and order ID as inputs. This tool queries Azure CosmosDB for the relevant order information.

- The specific_order_tool retrieves the order details from Azure CosmosDB using the provided phone number and order ID. This step ensures that the correct order information is obtained.

- Once the order details are retrieved, they are sent back to the LLM. This information is necessary for the LLM to formulate a response.

- Finally, the LLM formats the response with the fetched order details and sends it back to the customer. This completes the process, providing the customer with the information they requested in a secure and efficient manner.

<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9rad27rowwlc3la1zgd8.png" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9rad27rowwlc3la1zgd8.png">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9rad27rowwlc3la1zgd8.png" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9rad27rowwlc3la1zgd8.png" width="1700">
 </a>

## Live URL

<a href="https://dghx6mmczrmj4mk-web.azurewebsites.net/">https://dghx6mmczrmj4mk-web.azurewebsites.net/</a> 

> <b>CAUTION :</b> If the site is slow, it is due to the serverless infrastructure used for this application.