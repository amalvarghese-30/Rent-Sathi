from user_agents import parse


def parse_user_agent(ua_string: str) -> dict:
    """Parse a User-Agent string into browser, OS, and device type."""
    try:
        ua = parse(ua_string)
        return {
            "browser": f"{ua.browser.family} {ua.browser.version_string}" if ua.browser.family else "Unknown",
            "os": f"{ua.os.family} {ua.os.version_string}" if ua.os.family else "Unknown",
            "device": "Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "Desktop",
        }
    except Exception:
        return {"browser": "Unknown", "os": "Unknown", "device": "Desktop"}
