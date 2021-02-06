/// <reference types="cypress" />

context('Actions', () => {
  beforeEach(() => {
    cy.visit('0.0.0.0:8080')
  })
  it('Check if the page is loaded', () => {
    cy.contains('Lobby')
  })
  it('Check that we can see username', () => {
    cy.contains('Create').click()
  });
})
