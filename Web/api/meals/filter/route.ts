async function handleFilterSelect(filterName: string) {
  setIsFilterOpen(false);
  setIsLoading(true);

  try {
    const res = await fetch(`/api/meals/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: filterName, userId: TEST_USER_ID }),
    });

    const text = await res.text(); // <-- read raw body safely
    if (!res.ok) {
      console.error("Filter API error:", res.status, text);
      throw new Error(`Filter API failed (${res.status})`);
    }

    if (!text) {
      console.error("Filter API returned empty body");
      setRecipes([]);
      return;
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Filter API returned non-JSON:", text);
      setRecipes([]);
      return;
    }

    const mealArray = data?.meals ? data.meals : Array.isArray(data) ? data : [];
    setRecipes(mealArray);
  } catch (err) {
    console.error("Filtering failed:", err);
    setRecipes([]);
  } finally {
    setIsLoading(false);
  }
}