## Problem statement

Lately, many clients have shown a keen interest in exploring the capabilities of LLMs/SLMs by addressing various challenges. This sparked a discussion with my current client about enhancing operational efficiency in the customer care department. However, other priorities soon took precedence, and the project was put on hold. It wasn't until I recently heard about a hackathon focused on AI solutions that my desire to tackle this challenge was reignited.

I chose customer service as my problem statement because it's something many of us can easily relate to. My idea is to build a smart, autonomous assistant that can handle customer queries, such as answering FAQs, and intelligently respond to questions about past orders without the need for long waits or multiple transfers. A key focus was ensuring this assistant could verify users and provide personalized information securely.

<a class="lightgallery" href="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3B0dmxuYmx0djh0ZXRibHE1bm9pdnB4cGVnZnU1aXdpZTQ5Z3R1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3rgXBBaVvhPXk3NSnK/giphy.webp" title="Image description" data-thumbnail="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3B0dmxuYmx0djh0ZXRibHE1bm9pdnB4cGVnZnU1aXdpZTQ5Z3R1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3rgXBBaVvhPXk3NSnK/giphy.webp">
 <img class="lazyautosizes lazyloaded" data-src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3B0dmxuYmx0djh0ZXRibHE1bm9pdnB4cGVnZnU1aXdpZTQ5Z3R1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3rgXBBaVvhPXk3NSnK/giphy.webp" src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3B0dmxuYmx0djh0ZXRibHE1bm9pdnB4cGVnZnU1aXdpZTQ5Z3R1dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3rgXBBaVvhPXk3NSnK/giphy.webp" width="700">
 </a>

Imagine a customer needing to check the status of their last order. With our assistant, they could simply input their query, receive an OTP on their phone, and verify their identity securely. The assistant would then fetch the details from the database and provide the information instantly. No more waiting on hold, no more frustration.

## Solution 

I wanted to tackle this challenge by leveraging LangChain Agent to build an autonomous solution with minimal human intervention. The core idea behind agents is to use a language model to determine a sequence of actions to take, unlike traditional chains where the sequence is hardcoded. LangChain Agents act as reasoning engines, deciding which actions to take and in what order, making the system both flexible and intelligent. For instance, if a customer asks about their last order, the agent can simultaneously initiate OTP authentication, query the database for order details, and handle any additional requests in the proper sequence. This ensures that each task is executed efficiently and accurately.

> "In the movie "The Matrix," Agent Smith famously says, "Human beings are a disease, a cancer of this planet. You are a plague, and we are the cure." <br />I believe that is where we are heading these days with multi agents taking over"


<a class="lightgallery" href="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjgxMTd5ZmlvZDMxYWxkNDBsOTl0aXhvaXdhZnE3OGZrN3hzaWV6MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OS0HFk7Fmkdqw/giphy.webp" title="Image description" data-thumbnail="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjgxMTd5ZmlvZDMxYWxkNDBsOTl0aXhvaXdhZnE3OGZrN3hzaWV6MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OS0HFk7Fmkdqw/giphy.webp">
 <img class="lazyautosizes lazyloaded" data-src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjgxMTd5ZmlvZDMxYWxkNDBsOTl0aXhvaXdhZnE3OGZrN3hzaWV6MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OS0HFk7Fmkdqw/giphy.webp" src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjgxMTd5ZmlvZDMxYWxkNDBsOTl0aXhvaXdhZnE3OGZrN3hzaWV6MCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OS0HFk7Fmkdqw/giphy.webp" width="700">
 </a>

Bringing this idea to life was not an easy task. It required seamlessly integrating various technologies. We used OTP authentication for secure user verification, Twilio API to send OTPs, and Azure Cosmos DB to store and verify customer information. The challenge was to make this process smooth and autonomous, ensuring customers received quick and accurate responses without compromising security. We utilized Azure Cosmos DB for MongoDB vCore's vector search capability to retrieve relevant documents when a customer asks a query.

We set up two vector indexes: one for retrieving relevant product information from our product collection and another based on FAQs. Using Azure Document Intelligence Service, we retrieved information from existing FAQ PDFs, created a data ingestor to chunk the data, and generated embeddings in our database.

This approach transforms customer service by creating a smart, autonomous assistant that operates with high efficiency and minimal delay. The integration of LangChain Agent with Azure Cosmos DB, Twilio API, and Azure Document Intelligence Service ensures a robust, secure, and intelligent solution for handling customer queries.

Through the DTDL-CustomerCare series, we will explore the architecture and components that make this innovative solution possible. From data ingestion and AI integration to secure authentication and function calling, we’ll delve into each aspect in detail. Our goal is to share insights and knowledge that can help others build similar solutions, ultimately enhancing the customer service experience for everyone.

## Architecture


<a class="lightgallery" href="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vapnr6ncvq2n07q1425n.gif" title="Image description" data-thumbnail="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vapnr6ncvq2n07q1425n.gif">
 <img class="lazyautosizes lazyloaded" data-src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vapnr6ncvq2n07q1425n.gif" src="https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vapnr6ncvq2n07q1425n.gif" width="1700">
 </a>

## Data Flow

### Document Intelligence Process

The idea behind this process was to scrape the website or generate some potential dummy FAQs related to Telekom services using ChatGPT. I then compiled all the possible FAQs into a PDF.

- First, I analyzed the PDF using the Azure Document Intelligence Studio and found that the Layout model was the best fit for this case.
- Next, I created a Data Ingestor using an Azure Function HTTP trigger to upload the file and extract relevant information with the Azure Document Intelligence service client.
- The content was then semantically chunked based on their headings and stored as separate chunks in Azure CosmosDB for MongoDB vCore, within a collection called "KnowledgeBase."

A separate blog detailing how to create this will be provided in the next blog of this series.

### General query flow

#### FAQ Query Flow

- For general queries, the query is transformed into an embedding format using the embedding Ada model.
- The query is then subjected to a vector search on the FAQ collection, which we chunked and stored in our Azure CosmosDB for Mongo vCore during our earlier process.
- We retrieve the top k relevant documents from this search and provide them to the LLM.
- Finally, the LLM responds to the customer.

#### Products Query Flow
- If the query pertains to product information, it is transformed into an embedding format and a vector search is performed on the Products collection.
- We retrieve the top k relevant documents from this search and provide them to the LLM.
- Finally, the LLM responds to the customer.

### Past order query flow

- If the query is customer-specific, we start by obtaining the phone number via the agent.
- We then generate an OTP and store it in the database.
- The generated OTP is sent to the customer via the Twilio SMS API.
- The customer is prompted to input the OTP for verification.
- The customer inputs the OTP.
- We verify the OTP against the database and, upon successful verification, fetch the customer-related information.
- Once the information is retrieved, it is added to the LLM context.
- Finally, the LLM responds to the past order or customer-specific query.


## Source code

 <a href="https://github.com/Cloud-Jas/Dtdl-CustomerCare"> DTDL-CustomerCare </a>

## Live URL

<a href="https://dghx6mmczrmj4mk-web.azurewebsites.net/">https://dghx6mmczrmj4mk-web.azurewebsites.net/</a> 

> <b>CAUTION :</b> If the site is slow, it is due to the serverless infrastructure used for this application.

