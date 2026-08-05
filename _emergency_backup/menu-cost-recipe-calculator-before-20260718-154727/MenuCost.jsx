import { useMemo, useState } from "react";

const demoRecipes = [
  {
    id: "recipe-1",
    name: "Pepperoni Pizza",
    category: "Pizza",
    salePrice: 520,
    ingredients: [
      { name: "Hamur", quantity: 1, unit: "adet", unitCost: 32 },
      { name: "Mozzarella", quantity: 0.16, unit: "kg", unitCost: 320 },
      { name: "Pepperoni", quantity: 0.09, unit: "kg", unitCost: 780 },
      { name: "Domates sos", quantity: 0.08, unit: "kg", unitCost: 90 },
    ],
  },
  {
    id: "recipe-2",
    name: "No1 Dana Burger",
    category: "Burger",
    salePrice: 640,
    ingredients: [
      { name: "Burger köftesi", quantity: 0.18, unit: "kg", unitCost: 980 },
      { name: "Burger ekmeği", quantity: 1, unit: "adet", unitCost: 28 },
      { name: "Peynir", quantity: 0.04, unit: "kg", unitCost: 360 },
      { name: "Sos ve garnitür", quantity: 1, unit: "porsiyon", unitCost: 36 },
    ],
  },
  {
    id: "recipe-3",
    name: "Kara Od Bonfile",
    category: "Ana Yemek",
    salePrice: 1450,
    ingredients: [
      { name: "Bonfile", quantity: 0.22, unit: "kg", unitCost: 1650 },
      { name: "Patates / garnitür", quantity: 1, unit: "porsiyon", unitCost: 85 },
      { name: "Sos", quantity: 1, unit: "porsiyon", unitCost: 42 },
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
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function recipeCost(recipe) {
  return (recipe.ingredients || []).reduce((sum, item) => {
    return sum + Number(item.quantity || 0) * Number(item.unitCost || 0);
  }, 0);
}

function foodCostRate(recipe) {
  const salePrice = Number(recipe.salePrice || 0);
  if (!salePrice) return 0;

  return Math.round((recipeCost(recipe) / salePrice) * 100);
}

function grossProfit(recipe) {
  return Number(recipe.salePrice || 0) - recipeCost(recipe);
}

function getStatus(recipe) {
  const rate = foodCostRate(recipe);

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
  const [recipes, setRecipes] = useState(demoRecipes);
  const [selectedRecipeId, setSelectedRecipeId] = useState(demoRecipes[0]?.id || "");
  const [recipeForm, setRecipeForm] = useState(emptyRecipe);
  const [ingredientForm, setIngredientForm] = useState(emptyIngredient);
  const [message, setMessage] = useState("");

  const selectedRecipe = useMemo(() => {
    return recipes.find((recipe) => recipe.id === selectedRecipeId) || recipes[0] || null;
  }, [recipes, selectedRecipeId]);

  const summary = useMemo(() => {
    const totalSale = recipes.reduce((sum, recipe) => sum + Number(recipe.salePrice || 0), 0);
    const totalCost = recipes.reduce((sum, recipe) => sum + recipeCost(recipe), 0);
    const risky = recipes.filter((recipe) => getStatus(recipe) === "RISK").length;
    const averageFoodCost = totalSale > 0 ? Math.round((totalCost / totalSale) * 100) : 0;

    return {
      totalRecipes: recipes.length,
      totalSale,
      totalCost,
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
    setMessage("Yeni menü ürünü eklendi. Şimdi reçete kalemlerini ekleyebilirsin.");
  }

  function handleAddIngredient(event) {
    event.preventDefault();

    if (!selectedRecipe) {
      setMessage("Önce bir menü ürünü seç.");
      return;
    }

    if (!ingredientForm.name.trim()) {
      setMessage("Malzeme adı zorunlu.");
      return;
    }

    const newIngredient = {
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
    setMessage("Reçete kalemi eklendi.");
  }

  function removeIngredient(index) {
    if (!selectedRecipe) return;

    setRecipes((current) =>
      current.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              ingredients: recipe.ingredients.filter((_, itemIndex) => itemIndex !== index),
            }
          : recipe
      )
    );

    setMessage("Reçete kalemi kaldırıldı.");
  }

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>HandsOff Menü Kârlılığı</p>
          <h1 style={styles.title}>Menü Maliyet</h1>
          <p style={styles.subtitle}>
            Menü ürünlerinin reçete maliyetini, satış fiyatını, food cost oranını ve kârlılık durumunu tek ekranda takip edin.
          </p>
        </div>

        <div style={styles.heroCard}>
          <span style={styles.heroLabel}>Ortalama Food Cost</span>
          <strong style={summary.averageFoodCost <= 35 ? styles.heroValueOk : styles.heroValueWarn}>
            %{summary.averageFoodCost}
          </strong>
          <small style={styles.heroNote}>Tüm reçetelerin ortalama maliyet oranı</small>
        </div>
      </section>

      <section style={styles.kpiGrid}>
        <KpiCard title="Menü Ürünü" value={summary.totalRecipes} note="Reçetesi takip edilen ürün" />
        <KpiCard title="Toplam Satış Değeri" value={formatCurrency(summary.totalSale)} note="Ürün satış fiyatları toplamı" />
        <KpiCard title="Toplam Maliyet" value={formatCurrency(summary.totalCost)} note="Reçete maliyetleri toplamı" />
        <KpiCard title="Riskli Ürün" value={summary.risky} note="Food cost yüksek ürün" tone="danger" />
      </section>

      <section style={styles.createGrid}>
        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Yeni Menü Ürünü</h2>
          <p style={styles.panelText}>Ürünü ekleyip ardından reçete kalemlerini girebilirsin.</p>

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
              Menü Ürünü Ekle
            </button>
          </form>

          {message ? <div style={styles.infoMessage}>{message}</div> : null}
        </article>

        <article style={styles.panel}>
          <h2 style={styles.panelTitle}>Reçete Kalemi Ekle</h2>
          <p style={styles.panelText}>Seçili ürüne malzeme, miktar ve birim maliyet ekleyin.</p>

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
              Reçeteye Ekle
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
                  {selectedRecipe.category} · Satış fiyatı: {formatCurrency(selectedRecipe.salePrice)}
                </p>
              </div>

              <span style={{ ...styles.badge, ...getStatusStyle(getStatus(selectedRecipe)) }}>
                {getStatusLabel(getStatus(selectedRecipe))}
              </span>
            </div>

            <div style={styles.recipeStats}>
              <MiniStat label="Reçete Maliyeti" value={formatCurrency(recipeCost(selectedRecipe))} />
              <MiniStat label="Brüt Kâr" value={formatCurrency(grossProfit(selectedRecipe))} />
              <MiniStat label="Food Cost" value={`%${foodCostRate(selectedRecipe)}`} />
            </div>

            <div style={styles.tableWrap}>
              <div style={styles.tableHeader}>
                <span>Malzeme</span>
                <span>Miktar</span>
                <span>Birim Maliyet</span>
                <span>Toplam</span>
                <span></span>
              </div>

              {(selectedRecipe.ingredients || []).map((ingredient, index) => (
                <div key={ingredient.name + index} style={styles.tableRow}>
                  <strong>{ingredient.name}</strong>
                  <span>
                    {ingredient.quantity} {ingredient.unit}
                  </span>
                  <span>{formatCurrency(ingredient.unitCost)}</span>
                  <strong>{formatCurrency(Number(ingredient.quantity || 0) * Number(ingredient.unitCost || 0))}</strong>
                  <button type="button" style={styles.removeButton} onClick={() => removeIngredient(index)}>
                    Sil
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article style={styles.sidePanel}>
            <h2 style={styles.panelTitle}>Kârlılık Yorumu</h2>
            <p style={styles.panelText}>Food cost oranına göre hızlı değerlendirme.</p>

            <div style={styles.adviceBox}>
              {foodCostRate(selectedRecipe) <= 28 ? (
                <>
                  <strong>Ürün kârlı görünüyor.</strong>
                  <span>Food cost oranı iyi seviyede. Satış hacmi artırılabilir.</span>
                </>
              ) : foodCostRate(selectedRecipe) <= 35 ? (
                <>
                  <strong>Kontrol edilmeli.</strong>
                  <span>Food cost sınırda. Porsiyon, fire ve tedarik fiyatı izlenmeli.</span>
                </>
              ) : (
                <>
                  <strong>Riskli maliyet.</strong>
                  <span>Satış fiyatı, reçete gramajı veya tedarik maliyeti yeniden değerlendirilmeli.</span>
                </>
              )}
            </div>

            <div style={styles.noteList}>
              <div>
                <strong>Hedef food cost</strong>
                <span>%28 - %35 aralığı restoran için daha sağlıklı kabul edilir.</span>
              </div>

              <div>
                <strong>Reçete disiplini</strong>
                <span>Gramaj değişirse maliyet doğrudan etkilenir.</span>
              </div>

              <div>
                <strong>Satış fiyatı</strong>
                <span>Tedarik zamları sonrası satış fiyatı güncellenmeli.</span>
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
                  <p style={styles.cardText}>{recipe.category}</p>
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
                  <strong>{formatCurrency(recipeCost(recipe))}</strong>
                </div>

                <div style={styles.metaBox}>
                  <span>Food Cost</span>
                  <strong>%{foodCostRate(recipe)}</strong>
                </div>

                <div style={styles.metaBox}>
                  <span>Brüt Kâr</span>
                  <strong>{formatCurrency(grossProfit(recipe))}</strong>
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
    maxWidth: "780px",
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
    fontSize: "28px",
    color: "#ffffff",
  },
  kpiValueDanger: {
    display: "block",
    fontSize: "28px",
    color: "#fecaca",
  },
  kpiNote: {
    display: "block",
    color: "#94a3b8",
    marginTop: "8px",
  },
  createGrid: {
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
    gridTemplateColumns: "1.35fr 0.65fr",
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
  recipeStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "16px",
  },
  miniStat: {
    display: "grid",
    gap: "6px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.55)",
  },
  tableWrap: {
    display: "grid",
    gap: "8px",
    overflowX: "auto",
  },
  tableHeader: {
    minWidth: "720px",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr 70px",
    gap: "12px",
    padding: "0 14px 6px",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
  },
  tableRow: {
    minWidth: "720px",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr 70px",
    gap: "12px",
    alignItems: "center",
    padding: "13px 14px",
    borderRadius: "16px",
    background: "rgba(15,23,42,0.5)",
    border: "1px solid rgba(255,255,255,0.07)",
    color: "#e5e7eb",
    fontSize: "13px",
  },
  removeButton: {
    height: "32px",
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
  noteList: {
    display: "grid",
    gap: "10px",
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
