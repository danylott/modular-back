const mongoose = require("mongoose")
const { gql } = require("apollo-server")

module.exports = {
  Class: mongoose.model("class", {
    name: { type: String, unique: true },
    make: String,
    status: { type: String, default: "collecting" },
    markup: mongoose.Schema.Types.Mixed,
  }),
  classDefs: gql`
    # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.
    type Class {
      name: String!
      make: String
      status: String
      markup: [ClassMarkup]
    }

    type ClassMarkup {
      field: String
      x: Int
      y: Int
      w: Int
      h: Int
    }

    input ClassMarkupInput {
      field: String
      x: Int
      y: Int
      w: Int
      h: Int
    }
  `,
}
