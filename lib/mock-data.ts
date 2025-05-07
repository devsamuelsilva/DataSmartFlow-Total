// Função para gerar dados simulados para testes
export function generateMockProducts(productList: string[]) {
  return productList.map((productName, index) => {
    // Gerar um preço aleatório entre 5 e 100
    const price = Number((Math.random() * 95 + 5).toFixed(2))

    // Formatar o preço como string no formato brasileiro
    const priceFormatted = `R$ ${price.toFixed(2).replace(".", ",")}`

    // Gerar um código aleatório
    const code = `P${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`

    // Escolher um fornecedor aleatório
    const suppliers = ["Distribuidora ABC", "Farmácia XYZ", "Drogaria Central", "Fornecedor Médico"]
    const supplier = suppliers[Math.floor(Math.random() * suppliers.length)]

    // Escolher uma marca aleatória
    const brands = ["Genérico", "MedPharma", "FarmaPlus", "BioSaúde", "NaturaMed"]
    const brand = brands[Math.floor(Math.random() * brands.length)]

    return {
      original: productName,
      produto: productName,
      fornecedor: supplier,
      marca: brand,
      preco: price,
      preco_original: priceFormatted,
      codigo: code,
    }
  })
}
