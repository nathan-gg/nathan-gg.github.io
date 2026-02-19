// ===============================================================
// Assignment 3
// ===============================================================

async function fetchData() {
  const gamesWide = await d3.csv("data/videogames_wide.csv", d3.autoType);
  const gamesLong = await d3.csv("data/videogames_long.csv", d3.autoType);
  return { gamesWide, gamesLong };
}

fetchData().then(async ({ gamesWide, gamesLong }) => {
  const genreColorPalette = [
    "#e31a1c",
    "#fb9a99",
    "#b15928",
    "#ff7f00",
    "#fdbf6f",
    "#ffff9a",
    "#b2df8a",
    "#33a02c",
    "#a6cee3",
    "#1f78b4",
    "#cab4d5",
    "#6a3d9a",
  ];

  nintendo_consoles = [
    "3DS",
    "DS",
    "GB",
    "GBA",
    "GC",
    "N64",
    "NES",
    "SNES",
    "Wii",
    "WiiU",
  ];

  const A3V1Q1 = vl
    .markBar({ tooltip: true })
    .data(gamesLong)
    .title("Top 3 All Time Highest Selling Genres by Platform")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
      vl
        .aggregate(vl.sum("global_sales").as("g_sales"))
        .groupby(["platform", "genre"]), //using aggregate to get a sum of global_sales, grouped into platform and genre categories, so that I can rank each bar individually
      vl
        .window(vl.rank().as("Rank"))
        .sort(vl.field("g_sales").order("descending"))
        .groupby(["platform"]), //ranking the highest selling genres for each platform
      vl.filter("datum.Rank <= 3"), //filtering to only get the top 3 genres
    )
    .encode(
      vl
        .y()
        .fieldQ("g_sales") //using the median value for global sales to get a better idea of the platform's best-selling genres without being changed by outliers
        .scale({ domain: [0, 500] })
        .title("Global Sales (Millions)"), //title for y axis

      vl
        .x()
        .fieldN("platform") //put all the platforms on the x axis
        .title("Platform"), //title for x axis
      vl
        .color()
        .fieldN("genre")
        .scale({ range: genreColorPalette })
        .sort(vl.field("g_sales").order("descending"))
        .title("Genre"), //assigning a color for each genre, using scale to apply the colour palette I made, then sorting to show the genres in descending order
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "platform", title: "Platform" },
        { field: "genre", title: "Genre" },
        { field: "g_sales", title: "Total Global Sales", format: ".2f" }, //using .2f to truncate the sales for visibility
      ]),
    )
    .width(1000)
    .height(500)
    .toSpec();

  const A3V1Q2 = vl
    .markCircle({ tooltip: true })
    .data(gamesLong)
    .title("Highest Selling Games on Platforms with Less Than 100 Game Entries")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS      Games which are in the dataset with incorrect release dates

      vl.joinaggregate(vl.count("name").as("num_games")).groupby("platform"),
      vl.filter("datum.num_games < 25"),

      // vl.filter('datum.global_sales <= 0.17'),

      vl
        .aggregate(vl.sum("global_sales").as("total_sales"))
        .groupby(["platform", "genre", "name"]),
    )
    .encode(
      vl.x().fieldN("platform").title("Platform"),
      vl
        .y()
        .fieldQ("total_sales")
        .scale({ domain: [0, 500] })
        .title("Total Global Sales (Millions)"),
      vl
        .color()
        .fieldN("genre")
        .scale({ range: genreColorPalette })
        .title("Genre"),
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "name", title: "Name" },
        { field: "genre", title: "Genre" },
        {
          field: "total_sales",
          title: "Total Global Sales (Millions)",
          format: ".2f",
        }, //using .2f to truncate the sales for visibility
      ]),
    )
    .width(1000)
    .height(500)
    .toSpec();

  const A3V2Q1 = vl
    .markSquare({ tooltip: true })
    .data(gamesLong)
    .title("Lifetime of Each Platform")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out    the 2 DS Games which are in the dataset with incorrect release dates
    )
    .encode(
      vl
        .y()
        .fieldN("platform") //platforms on the y axis
        .title("Platform"),
      vl
        .x()
        .fieldO("year") //years on the x axis
        .title("Year"),
      vl
        .color()
        .fieldN("platform")
        .scale({ range: genreColorPalette })
        .title("Platform"),
      vl
        .size()
        .fieldQ("global_sales")
        .aggregate("count")
        .sort(vl.order("descending")) //using size to show when the platform's games sold best, the prime of the platform's life cycle
        .scale({ range: [0, 750] }) //increase size of all squares for visibility
        .title("Amount of Sales"),
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "platform", title: "Platform" },
        { field: "genre", title: "Genre" },
        { field: "global_sales", title: "Total Global Sales", format: ".2f" }, //using .2f to truncate the sales for visibility
      ]),
    )
    .config({
      legend: {
        symbolLimit: 0, //this is used to show all items in the legend, where Vega-lite naturally truncates the list
      },
      // background:'#e7e7e7'
    })
    .width(1000)
    .height(500)
    .toSpec();

  const A3V2Q2 = vl
    .markLine({ opacity: 0.5, tooltip: true })
    .data(gamesLong)
    .title("Highest Sold Genres Globally, by Year")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS      Games which are in the dataset with incorrect release dates
      vl
        .aggregate(vl.sum("global_sales").as("total_sales"))
        .groupby(["year", "genre"]),
    )
    .encode(
      vl.x().fieldO("year").title("Year"),
      vl
        .y()
        .fieldQ("total_sales")
        .scale({ domain: [0, 500] })
        .title("Global Sales (Millions)"),
      vl
        .color()
        .fieldN("genre")
        .scale({ range: genreColorPalette })
        .title("Genre"),
    )
    .width(1000)
    .height(500)
    .toSpec();

  const A3V3Q1 = vl
    .markLine({ opacity: 0.5, tooltip: true })
    .data(gamesLong)
    .title("Regional Sales of Games on Nintendo Platforms by Year")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS      Games which are in the dataset with incorrect release dates
      vl.filter("datum.sales_amount > 0"), //remove the regional sales with values of 0 due to region-exclusive games or limited data
      vl.filter(vl.field("platform").oneOf(nintendo_consoles)),
      vl
        .aggregate(vl.sum("sales_amount").as("sales"))
        .groupby(["year", "sales_region"]),
    )
    .encode(
      vl.x().fieldO("year").title("Year"),
      vl
        .y()
        .fieldQ("sales")
        .scale({ domain: [0, 500] })
        .title("Regional Sales (Millions)"),
      vl.color().fieldN("sales_region").title("Sales Region"),
    )
    .width(1000)
    .height(500)
    .toSpec();

  const A3V3Q2 = vl
    .markBar({ tooltip: true })
    .data(gamesLong)
    .title(
      "All Time Game Sales for Handheld vs. Non-Handheld Platforms, by Region",
    )
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS      Games which are in the dataset with incorrect release dates
      vl.filter("datum.sales_amount > 0"), //remove the regional sales with values of 0 due to region-exclusive games or limited data
      vl
        .calculate(
          "indexof(['WS','3DS','DS','GB','GBA','GG','PSP','PSV'], datum.platform) >= 0 ? 'Handheld' : 'Non-Handheld'",
        )
        .as("platform_type"),
      vl
        .aggregate(vl.average("sales_amount").as("sales"))
        .groupby(["platform_type", "sales_region"]),
    )
    .encode(
      vl.x().fieldN("sales_region").title("Region"),
      vl
        .y()
        .fieldQ("sales")
        .scale({ domain: [0, 500] })
        .title("Sales (Millions)"),
      vl.color().fieldN("platform_type").title("Platform Type"),
      vl.xOffset().fieldN("platform_type"),
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "platform_type", title: "Platform Type" },
        { field: "sales", title: "Total Sales", format: ".2f" }, //using .2f to truncate the sales for visibility
      ]),
    )
    .width(1000)
    .height(500)
    .config({
      legend: {
        symbolLimit: 0, //this is used to show all items in the legend, where Vega-lite naturally truncates the list
      },
    })
    .toSpec();

  const A3V4Q1 = vl
    .markBar({ tooltip: true })
    .data(gamesLong)
    .title("Top 5 Game Genres Sold for Nintendo Platforms")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS      Games which are in the dataset with incorrect release dates
      vl.filter(vl.field("platform").oneOf(nintendo_consoles)),
      vl
        .aggregate(vl.sum("global_sales").as("g_sales"))
        .groupby(["year", "genre"]),
      vl
        .window(vl.rank().as("Rank"))
        .groupby(["year"])
        .sort(vl.field("g_sales").order("descending")),
      vl.filter("datum.Rank <= 5"),
    )
    .encode(
      vl.x().fieldO("year").title("Years"),
      vl
        .y()
        .fieldQ("g_sales")
        .scale({ domain: [0, 500] })
        .title("Global Sales (Millions)"),
      vl
        .color()
        .fieldN("genre")
        .sort(vl.field("g_sales"), vl.order("descending"))
        .scale({ range: genreColorPalette })
        .title("Genre"),
      vl.order().fieldQ("g_sales").sort("ascending"),
      vl.tooltip([
        //inserting helpful info into the tooltip
        // {field: "platform", title: "Platform"},
        { field: "genre", title: "Genre" },
        { field: "g_sales", title: "Global Sales", format: ".2f" }, //using .2f to truncate the sales for visibility
      ]),
    )
    .width(1000)
    .height(500)
    .config({
      legend: {
        symbolLimit: 0, //this is used to show all items in the legend, where Vega-lite naturally truncates the list
      },
    })
    .toSpec();

  const A3V4Q2 = vl
    .markCircle({ tooltip: true })
    .data(gamesLong)
    .title("Most Sales vs Amount of Games Published by each Publisher")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS      Games which are in the dataset with incorrect release dates
      vl
        .aggregate(
          vl.count("name").as("num_games"),
          vl.sum("global_sales").as("total_sales"),
        )
        .groupby(["publisher"]),
    )
    .encode(
      vl
        .x()
        .fieldQ("num_games")
        .scale({ domain: [0, 500] })
        .title("Number of Games Published"),
      vl
        .y()
        .fieldQ("total_sales")
        .scale({ domain: [0, 500] })
        .title("Total Global Sales (Millions)"),
      vl.tooltip([
        //inserting helpful info into the tooltip
        // {field: "platform", title: "Platform"},
        { field: "num_games", title: "# of Games" },
        { field: "publisher", title: "Publisher" },
        { field: "total_sales", title: "Global Sales", format: ".2f" }, //using .2f to truncate the sales for visibility
      ]),
    )
    .width(1000)
    .height(500)
    .toSpec();

  render("#a3-v1-q1", A3V1Q1);
  render("#a3-v1-q2", A3V1Q2);
  render("#a3-v2-q1", A3V2Q1);
  render("#a3-v2-q2", A3V2Q2);
  render("#a3-v3-q1", A3V3Q1);
  render("#a3-v3-q2", A3V3Q2);
  render("#a3-v4-q1", A3V4Q1);
  render("#a3-v4-q2", A3V4Q2);
});

async function render(viewID, spec) {
  const result = await vegaEmbed(viewID, spec);
  result.view.run();
}
