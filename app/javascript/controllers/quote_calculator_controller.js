import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["quantity", "unitPrice", "discount", "tax", "subtotal", "total"]

  connect() {
    this.calculate()
  }

  calculate() {
    const subtotal = this.quantityTargets.reduce((sum, quantityInput, index) => {
      const quantity = Number.parseFloat(quantityInput.value || "0")
      const unitPrice = Number.parseFloat(this.unitPriceTargets[index]?.value || "0")
      return sum + quantity * unitPrice
    }, 0)

    const discount = Number.parseFloat(this.discountTarget?.value || "0")
    const tax = Number.parseFloat(this.taxTarget?.value || "0")
    const total = subtotal - discount + tax

    this.subtotalTarget.textContent = this.formatMoney(subtotal)
    this.totalTarget.textContent = this.formatMoney(total)
  }

  formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value || 0)
  }
}
