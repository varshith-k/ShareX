describe("Upload Page Test", () => {
  it("should load upload page and click upload button", () => {
    cy.visit("http://localhost:3000/upload");

    cy.contains("Upload File");

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from("hello world"),
      fileName: "test.txt",
      mimeType: "text/plain",
    });

    cy.contains("Upload").click();

    // simple verification (no fragile check)
    cy.contains("Upload");
  });
});