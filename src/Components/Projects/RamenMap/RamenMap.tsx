import * as React from "react";
import { readRemoteFile } from 'react-papaparse';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import { VectorMap } from "react-jvectormap";
import countryCodes from './CountryCodes';
import countryNames from './CountryNames';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableFooter from '@material-ui/core/TableFooter';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Rating from '@material-ui/lab/Rating';
import Chart from "react-apexcharts";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const brand = 1, variety = 2, style = 3, country = 4, stars = 5; //, top_ten = 6;
export class RamenMap extends React.Component<{}, { sum: number, ratingSums: any, ramenCount: any, ramenList: any, selected: any, page: number, rowsPerPage: number, emptyRows: number, mapType: string, pieData: any }> {
    constructor(props: any) {
        super(props);
        this.state = {
            sum: 0,
            ratingSums: {},
            ramenCount: {},
            ramenList: {},
            selected: {},
            page: 0,
            rowsPerPage: 5,
            emptyRows: 0,
            mapType: 'world',
            pieData: {
                series: [],
                options: {
                    chart: {
                        width: 380,
                        type: 'pie',
                    },
                    labels: [],
                    responsive: [{
                        breakpoint: 480,
                        options: {
                            chart: {
                                width: 200
                            },
                            legend: {
                                labels: {
                                    color: '#ffffff',
                                }
                            }
                        }
                    }],
                    legend: {
                        labels: {
                            colors: ['#ffffff'],
                        }
                    },
                    colors: ['#ff00ff', '#E91E63', '#ff0000', '#ff7f00', '#fee440', '#66DA26', '#00ec93', '#00ffff', '#2E93fA', '#0000ff', '#814ad6', '#8000ff']
                },
            },
        }
    }

    componentDidMount() {
        readRemoteFile('https://raw.githubusercontent.com/mwong775/mwong775.github.io/development/src/assets/ramen-ratings.csv', {
            complete: (results: any) => {
                // console.log('Results: ', results, results.data.length);
                // console.log(getData());  //gets an array of all countries names & codes: [{code: "AU", name: "Australia"}, ...]
                let ramenCount = {}, ramenList = {}, ratingSums = {};
                for (let i = 1; i < results.data.length; i++) {
                    let ramen = results.data[i];
                    if (ramen[0] === undefined)
                        continue;
                    let countryCode = countryCodes[ramen[country]];
                    if (ramenCount[countryCode] === undefined) {
                        ramenList[countryCode] = [];
                        ramenCount[countryCode] = 0;
                        ratingSums[countryCode] = 0;
                    }
                    ramenList[countryCode].push(ramen);
                    ratingSums[countryCode] += parseInt(ramen[stars], 0);
                    ramenCount[countryCode]++;
                }

                let countries: any = [];
                let counts: any = [];
                let other: number = 0;
                let otherCountries: number = 0;
                for (let countryCode in ramenCount) {
                    if (countryNames[countryCode]) {
                        if (ramenCount[countryCode] > 100) {
                            countries.push(countryNames[countryCode]);
                            counts.push(ramenCount[countryCode]);
                        } else {
                            other += ramenCount[countryCode]
                            otherCountries++;
                        }
                    }
                }
                countries.push('other (' + otherCountries + ' countries)');
                counts.push(other);

                this.setState(prevState => {
                    let existingData = Object.assign({}, prevState.pieData);
                    existingData.series = counts;
                    existingData.options.labels = countries;
                    return {
                        ramenCount: ramenCount,
                        ramenList: ramenList,
                        ratingSums: ratingSums,
                        pieData: existingData,
                        sum: results.data.length
                    }
                });
            }
        })
        console.log(this.state.ratingSums);
    }

    handleMapClick = (e, countryCode) => {
        // console.log(e, countryCode, countryNames[countryCode], this.state.ramenList[countryCode]);
        if (countryNames[countryCode] === undefined) {
            this.setState({
                selected: {
                    ramenCount: null,
                    country: '',
                    ramenList: [],
                    averageRating: 0,
                }
            });
        } else
            this.setState({
                selected: {
                    ramenCount: this.state.ramenCount[countryCode],
                    country: countryNames[countryCode],
                    ramenList: this.state.ramenList[countryCode],
                    averageRating: (this.state.ratingSums[countryCode] / this.state.ramenCount[countryCode]).toFixed(2),
                    emptyRows: this.state.rowsPerPage - Math.min(this.state.rowsPerPage, this.state.ramenList[countryCode].length - this.state.page * this.state.rowsPerPage),
                }
            });
        // fixes country tooltip overload issue
        setTimeout(() => { Array.from(document.getElementsByClassName("jvectormap-tip") as HTMLCollectionOf<HTMLElement>).forEach((el) => { el.style.display = 'none' }); }, 100);
    };

    handleChangePage = (e, newPage) => {
        this.setState({
            page: newPage
        });
    }

    handleChangeRowsPerPage = (event) => {
        this.setState({
            rowsPerPage: parseInt(event.target.value, 10),
            page: 0
        });
    }


    render() {
        return (
            <div className="App">
                <Link to="/projects"><Button className="back">Back</Button></Link>
                <div className="map-header" style={{ margin: '2% 0 0', height: '5%', display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                    <h2 className="gradient-font" style={{ margin: '0 3%' }}>Ramen Map</h2>
                    <h4>{this.state.sum} ramens, {Object.keys(this.state.ramenCount).length} countries</h4>
                </div>
                <div className="row">
                    <div>
                        <div style={{ padding: '0 7%', textAlign: 'left' }}>
                            <Accordion>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1a-content"
                                    id="panel1a-header"
                                >
                                    <Typography className="{classes.heading}">Context</Typography>
                                </AccordionSummary>
                                <AccordionDetails style={{ flexDirection: 'column' }}>
                                    <Typography paragraph>
                                        Dataset from <a href="https://www.kaggle.com/residentmario/ramen-ratings" target="_blank" rel="noopener noreferrer">Kaggle</a> (2018)
                                </Typography>
                                    <Typography paragraph>Displays various instant ramens produced by each country</Typography>
                                    <Typography paragraph>Note: countries not displayed below are either not in the dataset or not (yet) part of the country-code mapping</Typography>
                                </AccordionDetails>
                            </Accordion>
                            <Card style={{ marginTop: '7%' }}>
                                <CardContent>
                                    <Chart
                                        options={this.state.pieData.options}
                                        series={this.state.pieData.series}
                                        type="pie"
                                        height={360 + Math.random()}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {/* <Card>
                                <CardContent>
                                    <Chart
                                        options={this.state.pieData.options}
                                        series={this.state.pieData.series}
                                        type="pie"
                                        height={360 + Math.random()}
                                    />
                                </CardContent>
                            </Card> */}
                    <Card style={{ width: '60%', display: 'flex' }}>
                        <CardContent style={{ width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Button style={{ margin: '5px 2%' }} onClick={() => { this.setState({ mapType: 'world' }) }}>World</Button>
                                <Button style={{ margin: '5px 2%' }} onClick={() => { this.setState({ mapType: 'asia' }) }}>Asia</Button>
                                <Button style={{ margin: '5px 2%' }} onClick={() => { this.setState({ mapType: 'europe' }) }}>Europe</Button>

                            </div>
                            {this.state.mapType === 'world' &&
                                <VectorMap
                                    map={`${this.state.mapType}_mill`}
                                    ref={"map"}
                                    backgroundColor="transparent" //change it to ocean blue: #0077be
                                    zoomOnScroll={false}
                                    containerStyle={{
                                        height: "85%"
                                    }}
                                    onRegionClick={this.handleMapClick} //gets the country code
                                    containerClassName="map"
                                    regionStyle={{
                                        initial: {
                                            fill: "#e4e4e4",
                                            "fill-opacity": 0.9,
                                            stroke: "none",
                                            "stroke-width": 0,
                                            "stroke-opacity": 0
                                        },
                                        hover: {
                                            "fill-opacity": 0.8,
                                            cursor: "pointer"
                                        },
                                        selected: {
                                            fill: "#2938bc" //color for the clicked country
                                        },
                                        selectedHover: {}
                                    }}
                                    // regionsSelectable={true}
                                    series={{
                                        regions: [
                                            {
                                                values: this.state.ramenCount, //this is your data
                                                scale: ["#e0ccff", "#5c00e6"], //your color game's here
                                                normalizeFunction: "polynomial"
                                            }
                                        ]
                                    }}
                                />
                            }
                            {
                                this.state.mapType === 'asia' &&
                                <VectorMap
                                    map={"asia_mill"}
                                    ref={"map"}
                                    backgroundColor="transparent" //change it to ocean blue: #0077be, rgba(2, 123, 255, 0.4)
                                    zoomOnScroll={false}
                                    containerStyle={{
                                        height: "85%"
                                    }}
                                    onRegionClick={this.handleMapClick} //gets the country code
                                    containerClassName="map"
                                    regionStyle={{
                                        initial: {
                                            fill: "#e4e4e4",
                                            "fill-opacity": 0.9,
                                            stroke: "none",
                                            "stroke-width": 0,
                                            "stroke-opacity": 0
                                        },
                                        hover: {
                                            "fill-opacity": 0.8,
                                            cursor: "pointer"
                                        },
                                        selected: {
                                            fill: "#2938bc" //color for the clicked country
                                        },
                                        selectedHover: {}
                                    }}
                                    // regionsSelectable={true}
                                    series={{
                                        regions: [
                                            {
                                                values: this.state.ramenCount, //this is your data
                                                scale: ["#e0ccff", "#5c00e6"], //your color game's here
                                                normalizeFunction: "polynomial"
                                            }
                                        ]
                                    }}
                                />
                            }
                             {
                                this.state.mapType === 'europe' &&
                                <VectorMap
                                    map={"europe_mill"}
                                    ref={"map"}
                                    backgroundColor="transparent" //change it to ocean blue: #0077be, rgba(2, 123, 255, 0.4)
                                    zoomOnScroll={false}
                                    containerStyle={{
                                        height: "85%"
                                    }}
                                    onRegionClick={this.handleMapClick} //gets the country code
                                    containerClassName="map"
                                    regionStyle={{
                                        initial: {
                                            fill: "#e4e4e4",
                                            "fill-opacity": 0.9,
                                            stroke: "none",
                                            "stroke-width": 0,
                                            "stroke-opacity": 0
                                        },
                                        hover: {
                                            "fill-opacity": 0.8,
                                            cursor: "pointer"
                                        },
                                        selected: {
                                            fill: "#2938bc" //color for the clicked country
                                        },
                                        selectedHover: {}
                                    }}
                                    // regionsSelectable={true}
                                    series={{
                                        regions: [
                                            {
                                                values: this.state.ramenCount, //this is your data
                                                scale: ["#e0ccff", "#5c00e6"], //your color game's here
                                                normalizeFunction: "polynomial"
                                            }
                                        ]
                                    }}
                                />
                            }
                        </CardContent>
                    </Card>
                </div>
                <div style={{ paddingLeft: '3%', textAlign: 'left' }}>
                    <div style={{ textAlign: 'left' }}>
                        {this.state.selected.ramenList &&
                            <h4>
                                Country: {this.state.selected.country}<br />
                                Ramen count: {this.state.selected.ramenCount}<br />
                                Average rating: <Rating name="half-rating-read" defaultValue={2.5} value={this.state.selected.averageRating} precision={0.25} readOnly /> ({this.state.selected.averageRating})
                            </h4>
                        }
                    </div>
                    {this.state.selected.ramenList &&
                        <TableContainer component={Paper}>
                            <Table className="{classes.table}" aria-label="simple table">
                                <TableHead>
                                    <TableRow hover>
                                        <TableCell>Brand</TableCell>
                                        <TableCell>Variety</TableCell>
                                        <TableCell>Style</TableCell>
                                        <TableCell>Rating (Stars)</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(this.state.rowsPerPage > 0
                                        ? this.state.selected.ramenList.slice(this.state.page * this.state.rowsPerPage, this.state.page * this.state.rowsPerPage + this.state.rowsPerPage)
                                        : this.state.selected.ramenList
                                    ).map((row) => (
                                        <TableRow key={row[variety]}>
                                            <TableCell component="th" scope="row">
                                                {row[brand]}
                                            </TableCell>
                                            <TableCell>{row[variety]}</TableCell>
                                            <TableCell>{row[style]}</TableCell>
                                            <TableCell><Rating name="half-rating-read" defaultValue={2.5} value={parseInt(row[stars])} precision={0.25} readOnly /></TableCell>
                                        </TableRow>
                                    ))}
                                    {this.state.emptyRows > 0 && (
                                        <TableRow style={{ height: 53 * this.state.emptyRows }}>
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                            colSpan={3}
                                            count={this.state.selected.ramenList.length}
                                            rowsPerPage={this.state.rowsPerPage}
                                            page={this.state.page}
                                            onChangePage={this.handleChangePage}
                                            onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    }
                </div>
            </div>
        );
    }
}