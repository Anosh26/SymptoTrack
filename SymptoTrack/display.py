def display_result(result):
    print("\nPATIENT RISK ASSESSMENT\n")

    # ---- PAIN LEVEL ----
    print("PAIN LEVEL:")
    pain_today = result.get("pain_today", "N/A")
    pain_trend = result.get("pain_trend", "N/A")
    print(f"Today: {pain_today}")
    print(f"Trend: {pain_trend}\n")

    # ---- CHECKLIST SYMPTOMS ----
    print("CHECKLIST SYMPTOMS:")
    checklist = result.get("checklist_symptoms", [])
    if checklist:
        for s in checklist:
            print(s)
    else:
        print("None")
    print()

    # ---- TRANSCRIPT ----
    print("TRANSCRIPT:")
    print(result.get("transcript", "No transcript available"))
    print()

    # ---- KEYWORDS ----
    print("EXTRACTED KEYWORDS:")
    keywords = result.get("keywords", [])
    print(", ".join(keywords) if keywords else "None")
    print()

    # ---- RISK FACTORS ----
    print("DETECTED SYMPTOMS USED FOR RISK:")
    xai_explanation = result.get("xai_explanation", [])
    if xai_explanation:
        for exp in xai_explanation:
            print(f"🔴 High-risk: {exp}")
    else:
        print("None")
    print()

    # ---- RISK LEVEL ----
    print("RISK LEVEL:")
    print(result.get("risk_level", "UNKNOWN"))
    print()

    # ---- XAI DETAILS ----
    print("XAI EXPLANATION:")
    if xai_explanation:
        for i, exp in enumerate(xai_explanation, start=1):
            print(f"{i}. {exp}")
    else:
        print("No explanation available")