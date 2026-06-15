const ACTIVE_FILTER_CLASSES = ["border-blue-600", "bg-blue-600", "text-white", "shadow-lg", "shadow-blue-600/20"]
const INACTIVE_FILTER_CLASSES = ["border-slate-200", "bg-white", "text-slate-700"]
const INACTIVE_HOVER_CLASSES = ["hover:border-blue-200", "hover:bg-blue-50", "hover:text-blue-700"]

const isAllCategory = (category) => category === "All"

const toggleClasses = (element, classNames, force) => {
  classNames.forEach((className) => element.classList.toggle(className, force))
}

const setActiveFilter = (buttons, activeButton) => {
  buttons.forEach((button) => {
    const isActive = button === activeButton

    button.setAttribute("aria-pressed", isActive.toString())
    toggleClasses(button, ACTIVE_FILTER_CLASSES, isActive)
    toggleClasses(button, INACTIVE_FILTER_CLASSES, !isActive)
    toggleClasses(button, INACTIVE_HOVER_CLASSES, !isActive)
  })
}

const filterCards = (cards, selectedCategory) => {
  cards.forEach((card) => {
    const shouldShow = isAllCategory(selectedCategory) || card.dataset.projectCategory === selectedCategory

    card.hidden = !shouldShow
  })
}

const initFilterGroup = (filters) => {
  if (filters.dataset.initialized === "true") return

  filters.dataset.initialized = "true"
  const section = filters.closest("[data-project-section]") || document
  const buttons = filters.querySelectorAll("[data-project-filter]")
  const cards = section.querySelectorAll("[data-project-card]")

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-project-filter]")

    if (!button || !filters.contains(button)) return

    setActiveFilter(buttons, button)
    filterCards(cards, button.dataset.projectFilter)
  })
}

export const initProjectFilters = () => {
  document.querySelectorAll("[data-project-filters]").forEach(initFilterGroup)
}
