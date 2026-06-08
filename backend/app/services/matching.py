WEIGHTS = {"location": 40, "budget": 30, "property": 20, "amenities": 10}

REQUIREMENT_STATUSES = [
    "Draft", "Active", "Matching", "Matched", "Verification", "Connected", "Closed",
]
PROPERTY_STATUSES = [
    "Draft", "Pending Verification", "Verified", "Matched", "Inactive",
]
MATCH_STATUSES = [
    "Created", "Pending Admin", "Pending User", "Approved", "Rejected", "Connected",
]


def _norm(s: str) -> str:
    return s.strip().lower()


def score_location(req_area: str, prop_area: str) -> int:
    if not req_area or not prop_area:
        return 0
    a, b = _norm(req_area), _norm(prop_area)
    if a == b:
        return WEIGHTS["location"]
    if a in b or b in a:
        return round(WEIGHTS["location"] * 0.7)
    ta = a.split(" ")[0] if " " in a else a.split(",")[0]
    tb = b.split(" ")[0] if " " in b else b.split(",")[0]
    if ta and ta == tb:
        return round(WEIGHTS["location"] * 0.55)
    return round(WEIGHTS["location"] * 0.2)


def score_budget(budget_min: float, budget_max: float, rent: float) -> int:
    if not rent:
        return 0
    if budget_min <= rent <= budget_max:
        return WEIGHTS["budget"]
    target = (budget_min + budget_max) / 2 or rent
    rng = max(budget_max - budget_min, 1)
    diff = (budget_min - rent) if rent < budget_min else (rent - budget_max)
    penalty = min(1, diff / rng)
    return max(round(WEIGHTS["budget"] * (1 - penalty)), round(WEIGHTS["budget"] * 0.2))


def score_property(req_type: str, prop_type: str) -> int:
    if not req_type or not prop_type:
        return 0
    if _norm(req_type) == _norm(prop_type):
        return WEIGHTS["property"]
    order = ["Studio", "1 BHK", "2 BHK", "3 BHK", "PG"]
    try:
        i = next(idx for idx, t in enumerate(order) if _norm(t) == _norm(req_type))
        j = next(idx for idx, t in enumerate(order) if _norm(t) == _norm(prop_type))
    except StopIteration:
        return round(WEIGHTS["property"] * 0.2)
    if abs(i - j) == 1:
        return round(WEIGHTS["property"] * 0.5)
    return round(WEIGHTS["property"] * 0.2)


def score_amenities(req_amenities: list[str], prop_amenities: list[str]) -> int:
    if not req_amenities:
        return WEIGHTS["amenities"]
    prop_set = {_norm(a) for a in prop_amenities}
    matched = sum(1 for a in req_amenities if _norm(a) in prop_set)
    return round((matched / len(req_amenities)) * WEIGHTS["amenities"])


def score_match(requirement: dict, property_: dict) -> dict:
    location = score_location(requirement["area"], property_["area"])
    budget = score_budget(requirement["budget_min"], requirement["budget_max"], property_["rent"])
    prop = score_property(requirement["property_type"], property_["property_type"])
    amenities = score_amenities(requirement.get("amenities", []), property_.get("amenities", []))
    total = location + budget + prop + amenities
    return {
        "location": location,
        "budget": budget,
        "property": prop,
        "amenities": amenities,
        "total": total,
    }
