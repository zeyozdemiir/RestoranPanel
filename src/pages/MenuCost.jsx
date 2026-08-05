import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "handsoff_menu_cost_recipes";

const defaultRecipes = [
  {
    id: "recipe-dana-burger",
    name: "No1 Dana Burger",
    category: "Burger",
    salePrice: 640,
    ingredients: [
      { id: "ing-1", name: "Dana burger köftesi", quantity: 0.18, unit: "kg", unitCost: 980 },
      { id: "ing-2", name: "Burger ekmeği", quantity: 1, unit: "adet", unitCost: 28 },
      { id: "ing-3", name: "Cheddar / peynir", quantity: 0.04, unit: "kg", unitCost: 360 },
      { id: "ing-4", name: "Özel sos", quantity: 1, unit: "porsiyon", unitCost: 24 },
      { id: "ing-5", name: "Garnitür / yeşillik", quantity: 1, unit: "porsiyon", unitCost: 18 },
    ],
  },
  {
    id: "recipe-pepperoni",
    name: "Pepperoni Pizza",
    category: "Pizza",
    salePrice: 520,
    ingredients: [
      { id: "ing-6", name: "Pizza hamuru", quantity: 1, unit: "adet", unitCost: 32 },
      { id: "ing-7", name: "Mozzarella", quantity: 0.16, unit: "kg", unitCost: 320 },
      { id: "ing-8", name: "Pepperoni", quantity: 0.09, unit: "kg", unitCost: 780 },
      { id: "ing-9", name: "Domates sos", quantity: 0.08, unit: "kg", unitCost: 90 },
    ],
  },
];

const emptyRecipe = {
  name: "",
  category: "",
  salePrice: "",
};

const emptyIngredient = {
  name: "",
  quantity: "",
  unit: "",
  unitCost: "",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function calculateLineCost(item) {
  return Number(item.quantity || 0) * Number(item.unitCost || 0);
}

function calculateRecipeCost(recipe) {
  return (recipe.ingredients || []).reduce((sum, item) => {
    return sum + calculateLineCost(item);
  }, 0);
}

function calculateGrossProfit(recipe) {
  return Number(recipe.salePrice || 0) - calculateRecipeCost(recipe);
}

function calculateFoodCost(recipe) {
  const salePrice = Number(recipe.salePrice || 0);

  if (!salePrice) return 0;

  return (calculateRecipeCost(recipe) / salePrice) * 100;
}

function calculateTargetPrice(cost, targetRate) {
  const rate = Number(targetRate || 0);

  if (!cost || !rate) return 0;

  return cost / (rate / 100);
}

function getStatus(recipe) {
  const rate = calculateFoodCost(recipe);

  if (rate <= 28) return "GOOD";
  if (rate <= 35) return "WATCH";
  return "RISK";
}

function getStatusLabel(status) {
  if (status === "GOOD") return "Kârlı";
  if (status === "WATCH") return "Kontrol";
  if (status === "RISK") return "Riskli";
  return "Durum Yok";
}

function getStatusStyle(status) {
  if (status === "GOOD") return styles.badgeOk;
  if (status === "WATCH") return styles.badgeWarn;
  return styles.badgeError;
}

function MenuCost() {
  const [recipes, setRecipes] = useState(defaultRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState(defaultRecipes[0].id);
  const [recipeForm, setRecipeForm] = useState(emptyRecipe);
  const [ingredientForm, setIngredientForm] = useState(emptyIngredient);
  const [targetFoodCost, setTargetFoodCost] = useState(32);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecipes(parsed);
          setSelectedRecipeId(parsed[0].id);
        }
      }
    } catch {
      setRecipes(defaultRecipes);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  }, [recipes]);

  const selectedRecipe = useMemo(() => {
    return recipes.find((recipe) => recipe.id === selectedRecipeId) || recipes[0] || null;
  }, [recipes, selectedRecipeId]);

  const selectedCost = selectedRecipe ? calculateRecipeCost(selectedRecipe) : 0;
  const selectedProfit = selectedRecipe ? calculateGrossProfit(selectedRecipe) : 0;
  const selectedFoodCost = selectedRecipe ? calculateFoodCost(selectedRecipe) : 0;
  const selectedTargetPrice = calculateTargetPrice(selectedCost, targetFoodCost);

  const summary = useMemo(() => {
    const totalCost = recipes.reduce((sum, recipe) => sum + calculateRecipeCost(recipe), 0);
    const totalSale = recipes.reduce((sum, recipe) => sum + Number(recipe.salePrice || 0), 0);
    const risky = recipes.filter((recipe) => getStatus(recipe) === "RISK").length;
    const averageFoodCost = totalSale > 0 ? (totalCost / totalSale) * 100 : 0;

    return {
      totalRecipes: recipes.length,
      totalCost,
      totalSale,
      risky,
      averageFoodCost,
    };
  }, [recipes]);

  function handleCreateRecipe(event) {
    event.preventDefault();

    if (!recipeForm.name.trim()) {
      setMessage("Ürün adı zorunlu.");
      return;
    }

    const newRecipe = {
      id: "recipe-" + Date.now(),
      name: recipeForm.name.trim(),
      category: recipeForm.category.trim() || "Genel",
      salePrice: Number(recipeForm.salePrice || 0),
      ingredients: [],
    };

    setRecipes((current) => [newRecipe, ...current]);
    setSelectedRecipeId(newRecipe.id);
    setRecipeForm(emptyRecipe);
    setMessage("Yeni ürün eklendi. Şimdi içine reçete kalemlerini tek tek ekleyebilirsin.");
  }

  function handleAddIngredient(event) {
    event.preventDefault();

    if (!selectedRecipe) {
      setMessage("Önce bir ürün seç.");
      return;
    }

    if (!ingredientForm.name.trim()) {
      setMessage("Malzeme adı zorunlu.");
      return;
    }

    const newIngredient = {
      id: "ingredient-" + Date.now(),
      name: ingredientForm.name.trim(),
      quantity: Number(ingredientForm.quantity || 0),
      unit: ingredientForm.unit.trim() || "adet",
      unitCost: Number(ingredientForm.unitCost || 0),
    };

    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              ingredients: [...(recipe.ingredients || []), newIngredient],
            }
          : recipe
      )
    );

    setIngredientForm(emptyIngredient);
    setMessage("Reçete kalemi eklendi. Toplam maliyet ve kâr otomatik güncellendi.");
  }

  function removeIngredient(ingredientId) {
    if (!selectedRecipe) return;

    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              ingredients: recipe.ingredients.filter((item) => item.id !== ingredientId),
            }
          : recipe
      )
    );

    setMessage("Reçete kalemi silindi. Maliyet yeniden hesaplandı.");
  }

  function updateRecipeSalePrice(value) {
    if (!selectedRecipe) return;

    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              salePrice: Number(value || 0),
            }
          : recipe
      )
    );
  }

  function updateIngredient(ingredientId, key, value) {
    if (!selectedRecipe) return;

    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              ingredients: recipe.ingredients.map((item) =>
                item.id === ingredientId
                  ? {
                      ...item,
                      [key]: key === "quantity" || key === "unitCost" ? Number(value || 0) : value,
                    }
                  : item
              ),
            }
          : recipe
      )
    );
  }

  function resetDemo() {
    setRecipes(defaultRecipes);
    setSelectedRecipeId(defaultRecipes[0].id);
    setMessage("Örnek reçeteler geri yüklendi.");
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Reçete Maliyet</p>
          <h1 style={styles.title}>Menü Maliyet</h1>
          <p style={styles.subtitle}>
            Her ürünün içine sınırsız malzeme kalemi girin. Sistem satır maliyetlerini toplayarak ürün maliyetini, brüt kârı ve food cost oranını hesaplar.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Ortalama Food Cost</span>
          <strong style={summary.averageFoodCost <= 35 ? styles.heroValueOk : styles.heroValueWarn}>
            %{summary.averageFoodCost.toFixed(1)}
          </strong>
          <small style={styles.heroNote}>Veriler tarayıcıda kalıcı saklanır</small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Menü Ürünü" value={summary.totalRecipes} note="Reçetesi takip edilen ürün" />
        <KpiCard title="Toplam Reçete Maliyeti" value={formatCurrency(summary.totalCost)} note="Tüm ürünlerin maliyet toplamı" />
        <KpiCard title="Toplam Satış Değeri" value={formatCurrency(summary.totalSale)} note="Satış fiyatları toplamı" />
        <KpiCard title="Riskli Ürün" value={summary.risky} note="Food cost yüksek ürün" tone="danger" />
      </section>

      <section style={styles.topGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Menü Ürünü Oluştur</h2>
          <p style={styles.panelText}>Örneğin No1 Dana Burger, Pepperoni Pizza, Kara Od Bonfile gibi ürün aç.</p>

          <form onSubmit={handleCreateRecipe} style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Ürün adı"
              value={recipeForm.name}
              onChange={(event) => setRecipeForm({ ...recipeForm, name: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Kategori"
              value={recipeForm.category}
              onChange={(event) => setRecipeForm({ ...recipeForm, category: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Satış fiyatı"
              type="number"
              value={recipeForm.salePrice}
              onChange={(event) => setRecipeForm({ ...recipeForm, salePrice: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide}>
              Ürün Oluştur
            </button>
          </form>

          {message ? <div style={styles.infoMessage}>{message}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Ürün Seç ve Reçete Kalemi Ekle</h2>
          <p style={styles.panelText}>Seçili ürünün içine malzemeleri tek tek gir.</p>

          <select
            style={styles.selectFull}
            value={selectedRecipeId}
            onChange={(event) => setSelectedRecipeId(event.target.value)}
          >
            {recipes.map((recipe) => (
              <option key={recipe.id} value={recipe.id}>
                {recipe.name}
              </option>
            ))}
          </select>

          <form onSubmit={handleAddIngredient} style={styles.formGrid}>
            <input
              style={styles.input}
              placeholder="Malzeme adı"
              value={ingredientForm.name}
              onChange={(event) => setIngredientForm({ ...ingredientForm, name: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Miktar"
              type="number"
              step="0.01"
              value={ingredientForm.quantity}
              onChange={(event) => setIngredientForm({ ...ingredientForm, quantity: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Birim"
              value={ingredientForm.unit}
              onChange={(event) => setIngredientForm({ ...ingredientForm, unit: event.target.value })}
            />

            <input
              style={styles.input}
              placeholder="Birim maliyet"
              type="number"
              step="0.01"
              value={ingredientForm.unitCost}
              onChange={(event) => setIngredientForm({ ...ingredientForm, unitCost: event.target.value })}
            />

            <button type="submit" style={styles.buttonWide}>
              Reçete Kalemi Ekle
            </button>
          </form>
        </article>
      </section>

      {selectedRecipe ? (
        <section style={styles.detailGrid}>
          <article style={styles.largePanel}>
            <div style={styles.panelHeader}>
              <div>
                <h2 style={styles.panelTitle}>{selectedRecipe.name}</h2>
                <p style={styles.panelText}>
                  {selectedRecipe.category} · {selectedRecipe.ingredients.length} kalem reçete ürünü
                </p>
              </div>

              <span style={{ ...styles.badge, ...getStatusStyle(getStatus(selectedRecipe)) }}>
                {getStatusLabel(getStatus(selectedRecipe))}
              </span>
            </div>

            <section style={styles.calculationGrid}>
              <MiniStat label="Satış Fiyatı" value={formatCurrency(selectedRecipe.salePrice)} />
              <MiniStat label="Ürün Maliyeti" value={formatCurrency(selectedCost)} />
              <MiniStat label="Brüt Kâr" value={formatCurrency(selectedProfit)} />
              <MiniStat label="Food Cost" value={`%${selectedFoodCost.toFixed(1)}`} />
            </section>

            <div style={styles.priceEditor}>
              <div>
                <label style={styles.label}>Satış fiyatını güncelle</label>
                <input
                  style={styles.input}
                  type="number"
                  value={selectedRecipe.salePrice}
                  onChange={(event) => updateRecipeSalePrice(event.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>Hedef food cost %</label>
                <input
                  style={styles.input}
                  type="number"
                  value={targetFoodCost}
                  onChange={(event) => setTargetFoodCost(event.target.value)}
                />
              </div>

              <div style={styles.targetBox}>
                <span>Hedef satış fiyatı</span>
                <strong>{formatCurrency(selectedTargetPrice)}</strong>
              </div>
            </div>

            <div style={styles.tableWrap}>
              <div style={styles.tableHeader}>
                <span>Malzeme</span>
                <span>Miktar</span>
                <span>Birim</span>
                <span>Birim Maliyet</span>
                <span>Satır Maliyeti</span>
                <span></span>
              </div>

              {(selectedRecipe.ingredients || []).map((ingredient) => (
                <div key={ingredient.id} style={styles.tableRow}>
                  <input
                    style={styles.tableInput}
                    value={ingredient.name}
                    onChange={(event) => updateIngredient(ingredient.id, "name", event.target.value)}
                  />

                  <input
                    style={styles.tableInput}
                    type="number"
                    step="0.01"
                    value={ingredient.quantity}
                    onChange={(event) => updateIngredient(ingredient.id, "quantity", event.target.value)}
                  />

                  <input
                    style={styles.tableInput}
                    value={ingredient.unit}
                    onChange={(event) => updateIngredient(ingredient.id, "unit", event.target.value)}
                  />

                  <input
                    style={styles.tableInput}
                    type="number"
                    step="0.01"
                    value={ingredient.unitCost}
                    onChange={(event) => updateIngredient(ingredient.id, "unitCost", event.target.value)}
                  />

                  <strong>{formatCurrency(calculateLineCost(ingredient))}</strong>

                  <button
                    type="button"
                    style={styles.removeButton}
                    onClick={() => removeIngredient(ingredient.id)}
                  >
                    Sil
                  </button>
                </div>
              ))}

              {selectedRecipe.ingredients.length === 0 ? (
                <div style={styles.emptyRow}>Bu ürün için henüz reçete kalemi yok.</div>
              ) : null}
            </div>
          </article>

          <article style={styles.sidePanel}>
            <h2 style={styles.panelTitle}>Maliyet Yorumu</h2>
            <p style={styles.panelText}>Ürünün kârlılık durumu otomatik değerlendirilir.</p>

            <div style={styles.adviceBox}>
              {selectedFoodCost <= 28 ? (
                <>
                  <strong>Kârlılık iyi.</strong>
                  <span>Food cost düşük seviyede. Ürün satış hacmi artırılabilir.</span>
                </>
              ) : selectedFoodCost <= 35 ? (
                <>
                  <strong>Kontrol edilmeli.</strong>
                  <span>Food cost kabul edilebilir sınırda. Gramaj ve tedarik fiyatı takip edilmeli.</span>
                </>
              ) : (
                <>
                  <strong>Riskli maliyet.</strong>
                  <span>Satış fiyatı, reçete gramajı veya tedarik maliyeti yeniden değerlendirilmeli.</span>
                </>
              )}
            </div>

            <button type="button" style={styles.secondaryButton} onClick={resetDemo}>
              Örnek Reçeteleri Geri Yükle
            </button>

            <div style={styles.noteList}>
              <div>
                <strong>Formül</strong>
                <span>Ürün maliyeti = tüm kalemlerin miktar × birim maliyet toplamı.</span>
              </div>

              <div>
                <strong>Brüt kâr</strong>
                <span>Satış fiyatı - ürün maliyeti olarak hesaplanır.</span>
              </div>

              <div>
                <strong>Food cost</strong>
                <span>Ürün maliyeti / satış fiyatı × 100 olarak hesaplanır.</span>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      <section style={styles.grid}>
        {recipes.map((recipe) => {
          const status = getStatus(recipe);

          return (
            <article
              key={recipe.id}
              style={selectedRecipeId === recipe.id ? styles.cardSelected : styles.card}
              onClick={() => setSelectedRecipeId(recipe.id)}
            >
              <div style={styles.cardTop}>
                <div>
                  <h3 style={styles.cardTitle}>{recipe.name}</h3>
                  <p style={styles.cardText}>
                    {recipe.category} · {recipe.ingredients.length} kalem
                  </p>
                </div>

                <span style={{ ...styles.badge, ...getStatusStyle(status) }}>
                  {getStatusLabel(status)}
                </span>
              </div>

              <div style={styles.metaGrid}>
                <div style={styles.metaBox}>
                  <span>Satış</span>
                  <strong>{formatCurrency(recipe.salePrice)}</strong>
                </div>

                <div style={styles.metaBox}>
                  <span>Maliyet</span>
                  <strong>{formatCurrency(calculateRecipeCost(recipe))}</strong>
                </div>

                <div style={styles.metaBox}>
                  <span>Food Cost</span>
                  <strong>%{calculateFoodCost(recipe).toFixed(1)}</strong>
                </div>

                <div style={styles.metaBox}>
                  <span>Brüt Kâr</span>
                  <strong>{formatCurrency(calculateGrossProfit(recipe))}</strong>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function KpiCard({ title, value, note, tone }) {
  return (
    <article style={styles.kpiCard}>
      <span style={styles.kpiTitle}>{title}</span>
      <strong style={tone === "danger" ? styles.kpiValueDanger : styles.kpiValue}>{value}</strong>
      <small style={styles.kpiNote}>{note}</small>
    </article>
  );
}

function MiniStat({ label, value }) {
  return (
    <div style={styles.miniStat}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "28px",
    color: "#f8fafc",
    background:
      "radial-gradient(circle at top left, #581c87 0, transparent 34%), linear-gradient(135deg, #0f172a 0%, #111827 48%, #020617 100%)",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "20px",
    alignItems: "stretch",
    marginBottom: "20px",
  },
  eyebrow: {
    margin: 0,
    color: "#e9d5ff",
    fontSize: "12px",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    fontWeight: 800,
  },
  title: {
    margin: "8px 0",
    fontSize: "40px",
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    maxWidth: "820px",
    color: "#cbd5e1",
    lineHeight: 1.6,
    fontSize: "15px",
  },
  heroCard: {
    padding: "22px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.09)",
    border: "1px solid rgba(255,255,255,0.13)",
    boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
  },
  heroLabel: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "13px",
    marginBottom: "10px",
  },
  heroValueOk: {
    display: "block",
    fontSize: "36px",
    color: "#bbf7d0",
  },
  heroValueWarn: {
    display: "block",
    fontSize: "36px",
    color: "#fde68a",
  },
  heroNote: {
    display: "inline-block",
    marginTop: "10px",
    color: "#ddd6fe",
    background: "rgba(139,92,246,0.18)",
    padding: "6px 10px",
    borderRadius: "999px",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },
  kpiCard: {
    padding: "18px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  kpiTitle: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "13px",
    marginBottom: "10px",
  },
  kpiValue: {
    display: "block",
    fontSize: "27px",
    color: "#ffffff",
  },
  kpiValueDanger: {
    display: "block",
    fontSize: "27px",
    color: "#fecaca",
  },
  kpiNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  topGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    marginBottom: "16px",
  },
  panel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    marginBottom: "14px",
  },
  panelTitle: {
    margin: 0,
    fontSize: "21px",
  },
  panelText: {
    margin: "6px 0 14px",
    color: "#94a3b8",
    fontSize: "13px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  input: {
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
    outline: "none",
  },
  label: {
    display: "block",
    color: "#cbd5e1",
    fontSize: "12px",
    marginBottom: "6px",
    fontWeight: 800,
  },
  selectFull: {
    width: "100%",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.14)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 12px",
    outline: "none",
    marginBottom: "12px",
  },
  buttonWide: {
    gridColumn: "1 / -1",
    height: "44px",
    border: 0,
    borderRadius: "14px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  infoMessage: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "14px",
    color: "#ddd6fe",
    background: "rgba(139,92,246,0.16)",
    border: "1px solid rgba(139,92,246,0.22)",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1.45fr 0.55fr",
    gap: "16px",
    marginBottom: "16px",
  },
  largePanel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  sidePanel: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  calculationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px",
    marginBottom: "14px",
  },
  miniStat: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
  },
  priceEditor: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "12px",
    alignItems: "end",
    marginBottom: "16px",
    padding: "14px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.35)",
  },
  targetBox: {
    display: "grid",
    gap: "6px",
    padding: "12px",
    borderRadius: "14px",
    background: "rgba(34,197,94,0.14)",
    color: "#bbf7d0",
  },
  tableWrap: {
    display: "grid",
    gap: "8px",
    overflowX: "auto",
  },
  tableHeader: {
    minWidth: "920px",
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr 0.8fr 1fr 1fr 70px",
    gap: "10px",
    padding: "0 14px 6px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
  },
  tableRow: {
    minWidth: "920px",
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr 0.8fr 1fr 1fr 70px",
    gap: "10px",
    alignItems: "center",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e5e7eb",
    fontSize: "13px",
  },
  tableInput: {
    height: "36px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#0f172a",
    color: "#f8fafc",
    padding: "0 9px",
    outline: "none",
    minWidth: 0,
  },
  emptyRow: {
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    color: "#94a3b8",
  },
  removeButton: {
    height: "34px",
    border: 0,
    borderRadius: "10px",
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
    cursor: "pointer",
    fontWeight: 800,
  },
  badge: {
    flex: "0 0 auto",
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 900,
  },
  badgeOk: {
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.16)",
  },
  badgeWarn: {
    color: "#fde68a",
    background: "rgba(245,158,11,0.18)",
  },
  badgeError: {
    color: "#fecaca",
    background: "rgba(239,68,68,0.18)",
  },
  adviceBox: {
    display: "grid",
    gap: "8px",
    padding: "16px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.55)",
    color: "#cbd5e1",
    lineHeight: 1.55,
    marginBottom: "14px",
  },
  secondaryButton: {
    width: "100%",
    height: "42px",
    border: 0,
    borderRadius: "14px",
    marginBottom: "14px",
    color: "#ffffff",
    background: "rgba(139,92,246,0.35)",
    fontWeight: 900,
    cursor: "pointer",
  },
  noteList: {
    display: "grid",
    gap: "10px",
    color: "#cbd5e1",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.1)",
    cursor: "pointer",
  },
  cardSelected: {
    padding: "20px",
    borderRadius: "24px",
    background: "rgba(139,92,246,0.16)",
    border: "1px solid rgba(196,181,253,0.4)",
    cursor: "pointer",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "16px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
  },
  cardText: {
    margin: "7px 0 0",
    color: "#cbd5e1",
    lineHeight: 1.55,
    fontSize: "13px",
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  metaBox: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.45)",
  },
};

export default MenuCost;
