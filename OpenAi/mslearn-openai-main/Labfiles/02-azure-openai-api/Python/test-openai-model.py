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
        client = AzureOpenAI(
            azure_endpoint=azure_oai_endpoint,
            api_key=azure_oai_key,
            api_version="2024-05-01-preview"
            )


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
                "role": "system",
                "content": [
                    {
                    "type": "text",
                    "text": "너는 과일전문가야."
                    }
                ]
                },
                {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": "체리에 대해서 설명해줘"
                    }
                ]
                },
                {
                "role": "assistant",
                "content": [
                    {
                    "type": "text",
                    "text": "체리는 정말 귀엽고 사랑스러운 과일이에요! 🍒💖 쪼꼬미처럼 동그랗고 빨갛고, 정말 먹음직스럽죠? 그 작고 반짝이는 모습이 마치 보석 같지 않아요? ✨💎\n\n체리는 달콤하고 상큼한 맛이 나는 게, 한 입 베어 물면 입 안 가득 기분 좋은 맛이 퍼져요~ 😋🍬 그래서 여름에 먹으면 더 시원하고 기분 좋아지죠! 체리 한 알을 입에 넣고 음미하면, 마치 행복한 기운이 가득해지는 것 같아요~ 🍒💕 아, 그리고 그 씨를 빼고 먹는 재미도 있어요! 씨가 하나씩 빠져나갈 때마다 “오, 또 하나!” 이렇게 소소한 기쁨도 느껴져요~ 🥰\n\n체리는 건강에도 좋고, 피부에도 좋다고 하니까 자주 먹으면 더 예뻐질 수 있겠죠? ✨🌸\n\n체리처럼 예쁜 과일, 먹으면 기분도 좋아지고, 행복도 가득해요! 😘🍒"
                    }
                ]
                },
                {
                "role": "user",
                "content": [
                    {
                    "type": "text",
                    "text": "사과에 대해서 "
                    }
                ]
                },
                {
                "role": "assistant",
                "content": [
                    {
                    "type": "text",
                    "text": "사과는 매우 인기 있고 다양한 종류가 있는 과일이에요! 🍏🍎 사과는 둥글고 아삭한 식감이 특징으로, 한 입 베어 물면 상큼하고 달콤한 맛이 입안 가득 퍼지는 매력이 있죠. 이 과일은 \"하루에 사과 하나\"라는 말이 있을 만큼 건강에도 좋답니다! 🍏✨\n\n사과에는 비타민 C, 식이섬유, 항산화 물질 등이 풍부하게 들어 있어 면역력을 높이고 소화를 도와주는 데 효과적이에요. 🍏💪 또한, 사과에 들어 있는 폴리페놀 성분은 심혈관 건강에도 좋다고 알려져 있어요. \n\n사과는 생으로 먹는 것 외에도 다양한 요리에 활용할 수 있어요. 샐러드, 파이, 잼, 주스 등으로 변신할 수 있답니다. 🍰🍹 특히, 사과 파이는 많은 사람들이 좋아하는 디저트 중 하나예요!\n\n사과는 다양한 색상과 품종이 있어, 빨간 사과, 초록 사과, 노란 사과 등 여러 가지로 즐길 수 있어요. 각각의 맛과 식감이 다르니, 여러 가지를 시도해보는 것도 재미있겠죠? 🍏🍎\n\n이처럼 사과는 맛도 좋고 영양도 풍부한 과일로, 누구에게나 사랑받는 과일이에요! 😍🍏"
                    }
                ]
                },
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