// @TODO: YOUR CODE HERE!
// Setup SVG parameters
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create SVG group that will hold the chart
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// Function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenXAxis] - .5),
            d3.max(censusData, d => d[chosenXAxis]) 
        ])
        .range([0, width])
        .nice()
  
    return xLinearScale;
}

// Function used for updating y-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis] + .5),
            d3.max(censusData, d => d[chosenYAxis])
        ])
        .range([height, 0])
        .nice()
  
    return yLinearScale;
}


// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// Function used for updating circles group with a transition to new circles on x axis
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
  
    return circlesGroup;
    }

// Function used for updating circles group with a transition to new circles on y axis
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]))
  
    return circlesGroup;
    }

// Function used for updating circle labels with a transition to with circles
function renderXLabels(CircleLabels, newXScale, chosenXAxis) {

    CircleLabels.transition()
        .duration(1000)
        .attr("x", function(d) {
            return newXScale(d[chosenXAxis])})
              
    return CircleLabels;  
    }

// Function used for updating circle labels with a transition to with circles
function renderYLabels(CircleLabels, newYScale, chosenYAxis) {

    CircleLabels.transition()
        .duration(1000)
        .attr("y", function(d) {
            return newYScale(d[chosenYAxis]) + 4})
              
    return CircleLabels;  
    }

// Initialize tool tip
var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([35, -55])
.html(function(d) {
  return (`${d.state}<br> Poverty: ${d.poverty}%<br>Healthcare: ${d.healthcare}%`);
});

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, CircleLabels) {
    
    if (chosenXAxis === "poverty") {
        var xlabel = "Poverty:";
        var xtype = "%";
    }
    if (chosenXAxis === "age") {
        var xlabel = "Age:";
        var xtype = "";
    }
    if (chosenXAxis === "income") {
        var xlabel = "Income:";
        var xtype = "";
    }

    if (chosenYAxis === "healthcare") {
        var ylabel = "Healthcare:";
        var ytype = "%";
    }
    if (chosenYAxis === "smokes") {
        var ylabel = "Smokers:";
        var ytype = "%";
    }
    if (chosenYAxis === "obesity") {
        var ylabel = "Obesity:";
        var ytype = "%";
    }
  
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([35, -55])
        .html(function(d) {
            return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}${xtype}<br>${ylabel} ${d[chosenYAxis]}${ytype}`);
        });
  
    circlesGroup.call(toolTip);
    
    CircleLabels.on("mouseover", function(data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
  
    return circlesGroup;
}

// Import data from .csv file
d3.csv("assets/data/data.csv", function(error, censusData) {
    if (error) throw error;

    // Parse Data as numbers
    censusData.forEach(function(data) {
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.obesity = +data.obesity;

    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(censusData, chosenXAxis);

    // Create y scale function
    var yLinearScale = yScale(censusData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(censusData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", "12")
        .attr("class", "stateCircle")

    // Create circle labels with state abbr
    var CircleLabels = chartGroup.selectAll(null)
        .data(censusData)
        .enter()
        .append("text")

    CircleLabels
    .attr("x", function(d) {
        return xLinearScale(d[chosenXAxis]);
    })
    .attr("y", function(d) {
        return yLinearScale(d[chosenYAxis]) +4;
    })
    .text(function(d) {
        return d.abbr;
    })
    .attr("class", "stateText")
    .attr("font-size", "12px")
    
    // Create group for  2 x- axis labels
    var xLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .attr("class", "aText")
        .text("In Poverty (%)");
    
    var ageLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .attr("class", "aText inactive")
        .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .attr("class", "aText inactive")
        .text("Household Income (Median)");

    // Create group for  2 y- axis labels
    var yLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
        
    var healthcareLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left +40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare") // value to grab for event listener
        .attr("class", "aText")
        .text("Lacks Healthcare (%)");

    var smokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left +20)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes") // value to grab for event listener
        .attr("class", "aText inactive")
        .text("Smokes (%)");

    var obesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left +0)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity") // value to grab for event listener
        .attr("class", "aText inactive")
        .text("Obese (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, CircleLabels);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = value;

            // updates x scale for new data
            xLinearScale = xScale(censusData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderXAxes(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

            // updates labels with new x values
            CircleLabels = renderXLabels(CircleLabels, xLinearScale, chosenXAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, CircleLabels);

            // changes classes to change bold text
            if (chosenXAxis === "poverty") {
                povertyLabel
                .classed("active", true)
                .classed("inactive", false);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenXAxis === "age") {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", true)
                .classed("inactive", false);
                incomeLabel
                .classed("active", false)
                .classed("inactive", true);      
            }
            if (chosenXAxis === "income") {
                povertyLabel
                .classed("active", false)
                .classed("inactive", true);
                ageLabel
                .classed("active", false)
                .classed("inactive", true);
                incomeLabel
                .classed("active", true)
                .classed("inactive", false);      
            }
        }
    });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {

            // replaces chosenXAxis with value
            chosenYAxis = value;

            // updates y scale for new data
            yLinearScale = yScale(censusData, chosenYAxis);

            // updates y axis with transition
            yAxis = renderYAxes(yLinearScale, yAxis);

            // updates circles with new y values
            circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

            // updates labels with new y values
            CircleLabels = renderYLabels(CircleLabels, yLinearScale, chosenYAxis);

            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, CircleLabels);

            // changes classes to change bold text
            if (chosenYAxis === "healthcare") {
                healthcareLabel
                .classed("active", true)
                .classed("inactive", false);
                smokesLabel
                .classed("active", false)
                .classed("inactive", true);
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenYAxis === "smokes") {
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                smokesLabel
                .classed("active", true)
                .classed("inactive", false); 
                obesityLabel
                .classed("active", false)
                .classed("inactive", true);
            }
            if (chosenYAxis === "obesity") {
                healthcareLabel
                .classed("active", false)
                .classed("inactive", true);
                smokesLabel
                .classed("active", false)
                .classed("inactive", true); 
                obesityLabel
                .classed("active", true)
                .classed("inactive", false);    
            }
        }
    });
});
