import "trix"
import "@rails/actiontext"

const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024

const FONT_FAMILIES = [
  { label: "Default", attribute: null },
  { label: "Sans", attribute: "fontSans" },
  { label: "Serif", attribute: "fontSerif" },
  { label: "Monospace", attribute: "fontMono" },
  { label: "Display", attribute: "fontDisplay" }
]

const FONT_SIZES = [
  { label: "Default", attribute: null },
  { label: "Small", attribute: "sizeSmall" },
  { label: "Normal", attribute: "sizeNormal" },
  { label: "Large", attribute: "sizeLarge" },
  { label: "Extra large", attribute: "sizeXLarge" },
  { label: "2X large", attribute: "size2XLarge" }
]

const FONT_COLORS = [
  { label: "Default", attribute: null, swatch: "#334155" },
  { label: "Slate", attribute: "colorSlate", swatch: "#334155" },
  { label: "Blue", attribute: "colorBlue", swatch: "#2563eb" },
  { label: "Red", attribute: "colorRed", swatch: "#dc2626" },
  { label: "Green", attribute: "colorGreen", swatch: "#16a34a" },
  { label: "Amber", attribute: "colorAmber", swatch: "#d97706" },
  { label: "Purple", attribute: "colorPurple", swatch: "#9333ea" }
]

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const showEditorAlert = (message) => {
  window.alert(message)
}

const registerTextAttribute = (name, className, group) => {
  Trix.config.textAttributes[name] = {
    tagName: "span",
    className,
    group,
    inheritable: true
  }
}

const activateGroupAttribute = (editor, group, attribute) => {
  const attributes = Object.entries(Trix.config.textAttributes)
    .filter(([, config]) => config.group === group)
    .map(([name]) => name)

  attributes.forEach((name) => editor.deactivateAttribute(name))

  if (attribute) {
    editor.activateAttribute(attribute)
  }
}

const activeGroupAttribute = (editor, group) => {
  return Object.entries(Trix.config.textAttributes).find(([name, config]) => {
    return config.group === group && editor.attributeIsActive(name)
  })?.[0] || null
}

const editorForControl = (element) => {
  return element.closest(".admin-rich-text")?.querySelector("trix-editor")?.editor
}

const buildSelect = (label, options, group) => {
  const wrapper = document.createElement("label")
  wrapper.className = "trix-typography-control"
  wrapper.title = label

  const select = document.createElement("select")
  select.className = "trix-typography-select"
  select.dataset.trixTypographyGroup = group
  select.setAttribute("aria-label", label)

  options.forEach((option) => {
    const element = document.createElement("option")
    element.value = option.attribute || ""
    element.textContent = option.label
    select.appendChild(element)
  })

  select.addEventListener("mousedown", (event) => event.stopPropagation())
  select.addEventListener("change", (event) => {
    const editor = editorForControl(event.target)
    if (!editor) return

    activateGroupAttribute(editor, group, event.target.value || null)
  })

  wrapper.appendChild(select)
  return wrapper
}

const buildColorPicker = () => {
  const wrapper = document.createElement("div")
  wrapper.className = "trix-typography-control trix-typography-colors"
  wrapper.title = "Text color"

  const label = document.createElement("span")
  label.className = "trix-typography-label"
  label.textContent = "Color"
  wrapper.appendChild(label)

  const palette = document.createElement("div")
  palette.className = "trix-color-palette"

  const defaultButton = document.createElement("button")
  defaultButton.type = "button"
  defaultButton.className = "trix-color-swatch trix-color-swatch--default"
  defaultButton.title = "Default color"
  defaultButton.setAttribute("aria-label", "Default color")
  defaultButton.addEventListener("mousedown", (event) => event.preventDefault())
  defaultButton.addEventListener("click", (event) => {
    applyColor(event.currentTarget, null)
  })
  palette.appendChild(defaultButton)

  FONT_COLORS.filter((option) => option.attribute).forEach((option) => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "trix-color-swatch"
    button.style.backgroundColor = option.swatch
    button.title = option.label
    button.setAttribute("aria-label", option.label)
    button.dataset.trixColorAttribute = option.attribute
    button.addEventListener("mousedown", (event) => event.preventDefault())
    button.addEventListener("click", (event) => {
      applyColor(event.currentTarget, option.attribute)
    })
    palette.appendChild(button)
  })

  wrapper.appendChild(palette)
  return wrapper
}

const applyColor = (button, attribute) => {
  const editor = editorForControl(button)
  if (!editor) return

  activateGroupAttribute(editor, "fontColor", attribute)

  button.closest(".trix-color-palette")?.querySelectorAll(".trix-color-swatch").forEach((swatch) => {
    swatch.classList.toggle("trix-color-swatch--active", swatch === button)
  })
}

const syncTypographyControls = (editor, toolbarElement) => {
  toolbarElement.querySelectorAll("[data-trix-typography-group]").forEach((select) => {
    const active = activeGroupAttribute(editor, select.dataset.trixTypographyGroup)
    select.value = active || ""
  })

  const activeColor = activeGroupAttribute(editor, "fontColor")
  toolbarElement.querySelectorAll(".trix-color-swatch").forEach((swatch) => {
    const isDefault = !activeColor && swatch.classList.contains("trix-color-swatch--default")
    const isActive = activeColor && swatch.dataset.trixColorAttribute === activeColor
    swatch.classList.toggle("trix-color-swatch--active", isDefault || isActive)
  })
}

document.addEventListener("trix-file-accept", (event) => {
  if (event.file.size > MAX_ATTACHMENT_SIZE) {
    event.preventDefault()
    showEditorAlert(`Images must be smaller than ${formatBytes(MAX_ATTACHMENT_SIZE)}. This file is ${formatBytes(event.file.size)}.`)
  }
})

document.addEventListener("trix-attachment-add", (event) => {
  const { attachment } = event

  if (attachment.file && attachment.file.size > MAX_ATTACHMENT_SIZE) {
    attachment.remove()
    showEditorAlert(`Images must be smaller than ${formatBytes(MAX_ATTACHMENT_SIZE)}.`)
  }
})

document.addEventListener("trix-before-initialize", () => {
  Trix.config.blockAttributes.h2 = {
    tagName: "h2",
    terminal: true,
    breakOnReturn: true,
    group: false
  }

  Trix.config.blockAttributes.h3 = {
    tagName: "h3",
    terminal: true,
    breakOnReturn: true,
    group: false
  }

  registerTextAttribute("fontSans", "rich-font-sans", "fontFamily")
  registerTextAttribute("fontSerif", "rich-font-serif", "fontFamily")
  registerTextAttribute("fontMono", "rich-font-mono", "fontFamily")
  registerTextAttribute("fontDisplay", "rich-font-display", "fontFamily")

  registerTextAttribute("sizeSmall", "rich-text-sm", "fontSize")
  registerTextAttribute("sizeNormal", "rich-text-base", "fontSize")
  registerTextAttribute("sizeLarge", "rich-text-lg", "fontSize")
  registerTextAttribute("sizeXLarge", "rich-text-xl", "fontSize")
  registerTextAttribute("size2XLarge", "rich-text-2xl", "fontSize")

  registerTextAttribute("colorSlate", "rich-text-slate", "fontColor")
  registerTextAttribute("colorBlue", "rich-text-blue", "fontColor")
  registerTextAttribute("colorRed", "rich-text-red", "fontColor")
  registerTextAttribute("colorGreen", "rich-text-green", "fontColor")
  registerTextAttribute("colorAmber", "rich-text-amber", "fontColor")
  registerTextAttribute("colorPurple", "rich-text-purple", "fontColor")
})

document.addEventListener("trix-initialize", (event) => {
  const { toolbarElement } = event.target

  if (!toolbarElement || toolbarElement.querySelector(".trix-typography-tools")) return

  const textTools = toolbarElement.querySelector(".trix-button-group--text-tools")
  if (!textTools) return

  const headingGroup = document.createElement("span")
  headingGroup.className = "trix-button-group trix-button-group--heading-tools"
  headingGroup.innerHTML = `
    <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-2" data-trix-heading="h2" title="Heading 2" tabindex="-1">H2</button>
    <button type="button" class="trix-button trix-button--icon trix-button--icon-heading-3" data-trix-heading="h3" title="Heading 3" tabindex="-1">H3</button>
  `

  textTools.insertAdjacentElement("afterend", headingGroup)

  headingGroup.querySelectorAll("[data-trix-heading]").forEach((button) => {
    button.addEventListener("click", () => {
      const editor = event.target.editor
      const tag = button.dataset.trixHeading

      if (editor.attributeIsActive(tag)) {
        editor.deactivateAttribute(tag)
      } else {
        editor.activateAttribute(tag)
      }
    })
  })

  const typographyTools = document.createElement("div")
  typographyTools.className = "trix-typography-tools"
  typographyTools.appendChild(buildSelect("Font family", FONT_FAMILIES, "fontFamily"))
  typographyTools.appendChild(buildSelect("Font size", FONT_SIZES, "fontSize"))
  typographyTools.appendChild(buildColorPicker())

  headingGroup.insertAdjacentElement("afterend", typographyTools)
})

document.addEventListener("trix-selection-change", (event) => {
  const toolbarElement = event.target.toolbarElement
  if (!toolbarElement || !event.target.editor) return

  syncTypographyControls(event.target.editor, toolbarElement)
})
