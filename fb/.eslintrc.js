module.exports = {
  "parser" : "babel-eslint",
  "extends": "airbnb",
  "plugins": [
    "react",
    "jsx-a11y",
    "import"
  ],
  "rules": {
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }],
    "arrow-body-style": 0,
    "no-underscore-dangle": 0,
  }
};
