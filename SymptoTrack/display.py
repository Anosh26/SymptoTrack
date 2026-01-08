def display_result(result):
    print("\nPATIENT RISK ASSESSMENT\n")

    print("PAIN LEVEL:")
    print(f"Today: {result['pain_today']}")
    print(f"Trend: {result['pain_trend']}\n")

    print("CHECKLIST SYMPTOMS:")
    if result["checklist_symptoms"]:
        for s in result["checklist_symptoms"]:
            print(s)
    else:
        print("None")
    print()

    print("TRANSCRIPT:")
    print(result["transcript"])
    print()

    print("EXTRACTED KEYWORDS:")
    print(", ".join(result["keywords"]))
    print()

    print("DETECTED SYMPTOMS USED FOR RISK:")
    for exp in result["xai_explanation"]:
        print(f"🔴 High-risk: {exp}")
    print()

    print("RISK LEVEL:")
    print(result["risk_level"])
    print()

    print("XAI EXPLANATION:")
    for i, exp in enumerate(result["xai_explanation"], start=1):
        print(f"{i}. {exp}")
