const got = require("got");
const cheerio = require("cheerio");

async function data() {
  try {
    const response = await got("https://escapefromtarkov.gamepedia.com/Crafts");
    const $ = cheerio.load(response.body);
    return $("tr + tr")
      .get()
      .map((craft) => {
        // extract ingredients
        const ingredients = $("th:nth-of-type(1)", craft)
          .html()
          .split("+")
          .map((item) => {
            const name = $("a:nth-of-type(2)", item).text();
            const quantity = item.match(/(?<= x)[0-9]+/)[0];
            const icon = $("img", item).attr("src");
            return { name, quantity, icon };
          });

        // extract module
        const module = $("th:nth-of-type(3)", craft).text();

        // extract product
        let product = $("th:nth-of-type(5)", craft);
        product = {
          name: $("a:nth-of-type(2)", product).text(),
          quantity: product.html().match(/(?<= x)[0-9]+/)[0],
          icon: $("img", product).attr("src"),
        };

        return { ingredients, product, module };
      });
  } catch (error) {
    console.log(error.body);
  }
}

export default data;
