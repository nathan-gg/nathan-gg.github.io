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
        .groupby(["platform", "genre"]), //using aggregate to get a sum of global_sales,        grouped into platform and genre categories, so that I can rank each bar individually
      vl
        .window(vl.rank().as("Rank"))
        .sort(vl.field("g_sales").order("descending"))
        .groupby(["platform"]), //ranking the highest selling genres for each platform
      vl.filter("datum.Rank <= 3"), //filtering to only get the top 3 genres
    )
    .encode(
      vl
        .y()
        .fieldQ("g_sales") //y axis is global sales
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
        .title("Genre"), //encode genre with color palette, then sorting to show the genres in descending order
      vl.order().fieldQ("g_sales").sort("ascending"), //sorts the genres in each bar to go from least sales to most sales
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "platform", title: "Platform" },
        { field: "genre", title: "Genre" },
        { field: "g_sales", title: "Total Global Sales", format: ".2f" }, //using .2f to round the sales for visibility
      ]),
    )
    .height(400)
    .width(700)
    .toSpec();

  const A3V1Q2 = vl
    .markCircle({ tooltip: true, size: 300 })
    .data(gamesLong)
    .title("Highest Selling Games on Platforms with Less Than 100 Game Entries")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist" && datum.name != "Sonic CD"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates & filtering out Sonic CD for better visibility because it sold for 6 million and is a major outlier
      vl.joinaggregate(vl.count("name").as("num_games")).groupby("platform"), //count games for each platform and use joinaggregate to count the values and return them to the original objects to still use the values later
      vl.filter("datum.num_games < 100"), //filter out game platforms with over 100 entries

      vl
        .aggregate(vl.sum("global_sales").as("total_sales"))
        .groupby(["platform", "genre", "name"]), //get the sum of total sales with platform, genre, and name data for the tooltip
    )
    .encode(
      vl.x().fieldN("platform").title("Platform"), //x axis
      vl.y().fieldQ("total_sales").title("Total Global Sales (Millions)"), //y axis
      vl
        .color()
        .fieldN("genre")
        .scale({ range: genreColorPalette })
        .title("Genre"), //encode genre with color palette
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "name", title: "Name" },
        { field: "genre", title: "Genre" },
        {
          field: "total_sales",
          title: "Total Global Sales (Millions)",
          format: ".2f",
        }, //using .2f to round the sales for visibility
      ]),
    )
    .height(600)
    .width(700)
    .toSpec();

  const A3V2Q1 = vl
    .markSquare({ tooltip: true })
    .data(gamesLong)
    .title("Lifetime of Each Platform")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
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
      vl.color().fieldN("platform").title("Platform"),
      vl
        .size()
        .fieldQ("global_sales")
        .aggregate("sum")
        .sort(vl.order("descending")) //using size to show when the platform's games sold best, the prime of the platform's life cycle
        .scale({ range: [0, 1200] }) //scale squares for visibility
        .title("Amount of Sales"),
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "platform", title: "Platform" },
        { field: "genre", title: "Genre" },
        { field: "global_sales", title: "Total Global Sales", format: ".2f" }, //using .2f to round the sales for visibility
      ]),
    )
    .config({
      legend: {
        symbolLimit: 0, //this is used to show all items in the legend, where Vega-lite naturally truncates the list
      },
      background: "#f6f6f6",
    })
    .height(500)
    .width(700)
    .toSpec();

  const A3V2Q2 = vl
    .markLine({ opacity: 0.5, tooltip: true })
    .data(gamesLong)
    .title("Highest Sold Genres Globally, by Year")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
      vl
        .aggregate(vl.sum("global_sales").as("total_sales"))
        .groupby(["year", "genre"]), //group the sum of the global sale by year and genre into total_sales
    )
    .encode(
      vl.x().fieldO("year").title("Year"), //x axis
      vl.y().fieldQ("total_sales").title("Global Sales (Millions)"), //y axis
      vl
        .color()
        .fieldN("genre")
        .scale({ range: genreColorPalette })
        .title("Genre"), //encode genre with color palette
    )
    .height(600)
    .width(700)
    .toSpec();

  const A3V3Q1 = vl
    .markLine({ opacity: 0.5, tooltip: true })
    .data(gamesLong)
    .title("Regional Sales of Games on Nintendo Platforms by Year")
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
      vl.filter("datum.sales_amount > 0"), //remove the regional sales with values of 0 due to region-exclusive games or limited data
      vl.filter(vl.field("platform").oneOf(nintendo_consoles)), //filter by the nintendo_consoles array I made, so that only data entries for a Nintendo platform are used
      vl
        .aggregate(vl.sum("sales_amount").as("sales"))
        .groupby(["year", "sales_region"]), //get the sum total sales grouped by region,so that I only have 1 point/region for the line graph
    )
    .encode(
      vl.x().fieldO("year").title("Year"), //x axis
      vl.y().fieldQ("sales").title("Regional Sales (Millions)"), // y axis
      vl.color().fieldN("sales_region").title("Sales Region"),
    )
    .height(600)
    .width(700)
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
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
      vl.filter("datum.sales_amount > 0"), //remove the regional sales with values of 0 due to region-exclusive games or limited data
      vl
        .calculate(
          "indexof(['WS','3DS','DS','GB','GBA','GG','PSP','PSV'], datum.platform) >= 0 ? 'Handheld' : 'Non-Handheld'",
        )
        .as("platform_type"),
      //for each index in the array, see if datum.platform is in it. If it is, then check if the value >= 0, and by using the ternary operator, if the value >= 0, it means the datum.platform will be saved as Handheld for its platform_type category
      vl
        .aggregate(vl.average("sales_amount").as("sales"))
        .groupby(["platform_type", "sales_region"]), //get the average sales to get rid of the outlier games for both handheld and non-handheld platforms
    )
    .encode(
      vl.x().fieldN("sales_region").title("Region"), //main x axis is region
      vl.y().fieldQ("sales").title("Sales (Millions)"), //y axis is sales
      vl.color().fieldN("platform_type").title("Platform Type"),
      vl.xOffset().fieldN("platform_type"), //offset the bars to show both Handheld and Non-Handheld
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "platform_type", title: "Platform Type" },
        { field: "sales", title: "Average Sales", format: ".2f" }, //using .2f to round the sales for visibility
      ]),
    )
    .height(600)
    .width(700)
    .toSpec();

  const A3V4Q1 = vl
    .markBar({ tooltip: true })
    .data(gamesLong)
    .title("Top 5 Game Genres Sold for Nintendo Platforms")
    .height(500)
    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
      vl.filter(vl.field("platform").oneOf(nintendo_consoles)),
      vl
        .aggregate(vl.sum("global_sales").as("g_sales"))
        .groupby(["year", "genre"]), //sums global sales into groups so it's one value in the bar, instead of individual games
      vl
        .window(vl.rank().as("Rank"))
        .groupby(["year"])
        .sort(vl.field("g_sales").order("descending")), //rank the sales in descending order
      vl.filter("datum.Rank <= 5"), //filter only the top 5 genres per year to simplify graph viewing
    )
    .encode(
      vl.x().fieldO("year").title("Years"), //x axis
      vl.y().fieldQ("g_sales").title("Global Sales (Millions)"), //y axis
      vl
        .color()
        .fieldN("genre")
        .sort(vl.field("g_sales"), vl.order("descending"))
        .scale({ range: genreColorPalette })
        .title("Genre"), //encode genre with color palette
      vl.order().fieldQ("g_sales").sort("ascending"), //sorts the genres in each bar to go from least sales to most sales
      vl.tooltip([
        //inserting helpful info into the tooltip
        // {field: "platform", title: "Platform"},
        { field: "genre", title: "Genre" },
        { field: "g_sales", title: "Global Sales", format: ".2f" }, //using .2f to round the sales for visibility
      ]),
    )
    .height(600)
    .width(700)
    .config({
      legend: {
        symbolLimit: 0, //this is used to show all items in the legend, where Vega-lite naturally truncates the list
      },
    })
    .toSpec();

  const A3V4Q2 = vl
    .markCircle({ size: 100, tooltip: true })
    .data(gamesLong)
    .title("Most Sales vs Amount of Games Published by each Publisher")

    .transform(
      vl.filter(
        'datum.name != "Strongest Tokyo University Shogi DS" && datum.name != "Imagine: Makeup Artist"',
      ), //filtering out the 2 DS Games which are in the dataset with incorrect release dates
      vl
        .aggregate(
          vl.count("name").as("num_games"), //count the number of games
          vl.sum("global_sales").as("total_sales"),
        )
        .groupby(["publisher"]), //get the sum of total sales from each publisher
    )
    .encode(
      vl.x().fieldQ("num_games").title("Number of Games Published"), //x axis
      vl.y().fieldQ("total_sales").title("Total Global Sales (Millions)"), //y axis
      vl.tooltip([
        //inserting helpful info into the tooltip
        { field: "publisher", title: "Publisher" },
        { field: "num_games", title: "# of Games" },
        {
          field: "total_sales",
          title: "Global Sales (Millions)",
          format: ".2f",
        }, //using .2f to round the sales for visibility
      ]),
    )
    .height(600)
    .width(700)
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
