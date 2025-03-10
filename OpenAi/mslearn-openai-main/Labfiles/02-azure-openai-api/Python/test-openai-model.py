import os
from dotenv import load_dotenv


# TODO 1 : Add Azure OpenAI package
from openai import AzureOpenAI


def main(): 
        
    try: 
    
        # Get configuration settings 
        load_dotenv()
        azure_oai_endpoint = os.getenv("AZURE_OAI_ENDPOINT")
        azure_oai_key = os.getenv("AZURE_OAI_KEY")
        azure_oai_deployment = os.getenv("AZURE_OAI_DEPLOYMENT")
        
        # TODO 2 : Initialize the Azure OpenAI client...
        client = AzureOpenAI(azure_endpoint=azure_oai_endpoint, api_key=azure_oai_key, api_version="2024-05-01-preview")


        while True: 
            # Get input text
            input_text = input("Enter the prompt (or type 'quit' to exit): ")
            if input_text.lower() == "quit":
                break
            if len(input_text) == 0:
                print("Please enter a prompt.")
                continue

            print("\nSending request for summary to Azure OpenAI endpoint...\n\n")
            messages = [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": input_text
                        }
                    ]
                }
            ]        
            # TODO 3 : Add code to send request...
            completion = client.chat.completions.create(
                model=azure_oai_deployment,
                messages=messages,
                max_tokens=800,
                temperature=0.7,
                top_p=0.95
            )

            return_text = completion.choices[0].message.content
            print("Response: " + return_text + '\n')

    except Exception as ex:
        print(ex)

if __name__ == '__main__': 
    main()