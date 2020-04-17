const sourceDataUrl = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';
const width = 800;
const height = 500;
const barWidth = width / 275;

function extractYears(data) {
    return data.map(item => {
        let quarter;
        let temp = item[0].substring(5, 7);

        if (temp === '01') {
            quarter = 'Q1';
        } else if (temp === '04') {
            quarter = 'Q2';
        } else if (temp === '07') {
            quarter = 'Q3';
        } else if (temp === '10') {
            quarter = 'Q4';
        }
        return item[0].substring(0, 4) + ' ' + quarter
    });
}

function d3BarChartBuilder() {
    const svgContainer = d3.select('#barChart')
        .append('svg')
        .attr('width', width + 100)
        .attr('height', height + 60);

    const tooltip = d3.select("#barChart").append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);
    const overlay = d3.select('.visHolder').append('div')
        .attr('class', 'overlay')
        .style('opacity', 0);

    fetch(sourceDataUrl)
        .then(response => response.json())
        .then(result => {
            const data = result.data;
            const years = extractYears(data);
            const yearsDate = data.map(item => {
                return new Date(item[0]);
            });

            const xMax = new Date(d3.max(yearsDate));
            xMax.setMonth(xMax.getMonth() + 3);

            const xScale = d3.scaleTime()
                .domain([d3.min(yearsDate), xMax])
                .range([0, width]);

            const xAxis = d3.axisBottom()
                .scale(xScale);

            const xAxisGroup = svgContainer.append('g')
                .call(xAxis)
                .attr('id', 'x-axis')
                .attr('transform', 'translate(60, 500)');

            const gdpValues = data.map(item => item[1]);

            const gdpMin = d3.min(gdpValues);
            const gdpMax = d3.max(gdpValues);

            const gdpLinearScale = d3.scaleLinear()
                .domain([0, gdpMax])
                .range([0, height]);

            const gdpScaled = gdpValues.map(item => gdpLinearScale(item));

            const yAxisScale = d3.scaleLinear()
                .domain([0, gdpMax])
                .range([height, 0]);

            const yAxis = d3.axisLeft(yAxisScale);

            const yAxisGroup = svgContainer.append('g')
                .call(yAxis)
                .attr('id', 'y-axis')
                .attr('transform', 'translate(60, 0)');

            d3.select('svg').selectAll('rect')
                .data(gdpScaled)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('width', barWidth)
                .attr('height', (d) => d)
                .attr('x', (d, i) => xScale(yearsDate[i]))
                .attr('y', (d, i) => height - d)
                .attr('transform', 'translate(60, 0)')
                .attr('data-date', (d, i) => data[i][0])
                .attr('data-gdp', (d, i) => data[i][1])
                .on('mouseover', (d, i) => {
                    overlay.transition()
                        .duration(0)
                        .style('height', d + 'px')
                        .style('width', barWidth + 'px')
                        .style('opacity', .9)
                        .style('left', (i * barWidth) + 'px')
                        .style('top', height - d + 'px')
                        .style('transform', 'translateX(60px)');
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', .9);
                    tooltip.html(years[i] + '<br>' + '$' + gdpValues[i]
                        .toFixed(1)
                        .replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion')
                        .attr('data-date', data[i][0])
                        .style('left', (i * barWidth) + 30 + 'px')
                        .style('top', height - 100 + 'px')
                        .style('transform', 'translateX(60px)');
                })
                .on('mouseout',(d) => {
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', 0);
                    overlay.transition()
                        .duration(200)
                        .style('opacity', 0);
                });
        });
}

document.addEventListener("DOMContentLoaded", () => d3BarChartBuilder());


