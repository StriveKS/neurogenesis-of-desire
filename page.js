const params = new URLSearchParams(location.search);
const attributionKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "fbclid", "gclid"];
const checkoutLinks = document.querySelectorAll("[data-checkout]");

for (const link of [...checkoutLinks, ...document.querySelectorAll("[data-language]")]) {
  const target = new URL(link.href);
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value && !target.searchParams.has(key)) target.searchParams.set(key, value);
  }
  link.href = target.href;
}

for (const link of checkoutLinks) {
  link.addEventListener("click", () => window.fbq?.("track", "InitiateCheckout", {
    value: Number(document.body.dataset.value),
    currency: document.body.dataset.currency,
  }));
}

const experiment = document.querySelector("[data-experiment]");
const examples = Array.from(experiment.querySelectorAll(".example"));
const tabList = document.createElement("div");
tabList.className = "tablist";
tabList.setAttribute("role", "tablist");
tabList.setAttribute("aria-labelledby", "examples-title");

const tabs = examples.map((example, index) => {
  const tab = document.createElement("button");
  tab.type = "button";
  tab.id = `impulse-tab-${index}`;
  tab.textContent = example.querySelector("h3").textContent;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", example.id);
  example.setAttribute("role", "tabpanel");
  example.setAttribute("aria-labelledby", tab.id);
  example.tabIndex = 0;
  tab.addEventListener("click", () => selectTab(index));
  tab.addEventListener("keydown", event => {
    const nextIndex = {
      ArrowRight: (index + 1) % tabs.length,
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectTab(nextIndex);
    tabs[nextIndex].focus();
  });
  tabList.append(tab);
  return tab;
});

function selectTab(index) {
  tabs.forEach((tab, position) => {
    const active = position === index;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    examples[position].hidden = !active;
  });
}

experiment.prepend(tabList);
selectTab(0);

if ("IntersectionObserver" in window) {
  const heroButton = document.querySelector("#hero-buy");
  const offerButton = document.querySelector("#offer-buy");
  const sticky = document.querySelector("#sticky");
  let offerVisible = false;
  const updateSticky = () => {
    sticky.hidden = offerVisible || heroButton.getBoundingClientRect().bottom >= 0;
  };
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.target === offerButton) offerVisible = entry.isIntersecting;
    }
    updateSticky();
  });
  observer.observe(heroButton);
  observer.observe(offerButton);
}
