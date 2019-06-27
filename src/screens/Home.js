import React from 'react';
import { Block, BlockTitle, Navbar, NavTitle, Page, Button, Row, Col } from 'framework7-react';
import API from '../services/API';
import DataTransfer from '../services/DataTransfer';
import moment from 'moment';
import { orderBy } from 'lodash';
import { saveAs } from 'file-saver';
import './Home.scss';

const LATE_ON_TIME = '09:00:00';
export default class extends React.Component {
    fileSelected = null;
    dataTopDiTre = {};
    dataDsDiTre = [];

    state = {
        fileSelected: null,
        jsonIput: null,
        enableExport: false
    };

    render() {
        return (
            <Page id="Page-Home">
                <Navbar>
                    <NavTitle>Ds đi trễ</NavTitle>
                </Navbar>

                <Block strong>
                    <Row>
                        <Col>
                            <label id="lblChooseFile">
                                Choose a json file ...
                                <input
                                    type="file"
                                    id="fileInput"
                                    accept=".csv"
                                    onChange={this.fileOnChange.bind(this)}
                                />
                            </label>
                            {this.renderFileInfo()}
                            {this.state.jsonIput ? (
                                <Button fill onClick={this.onCopy.bind(this)}>
                                    Download CSV
                                </Button>
                            ) : null}
                        </Col>
                        <Col />
                    </Row>
                </Block>
                <Block id="list-item">{this.renderDSDiTre()}</Block>
            </Page>
        );
    }

    csvJSON(csv) {
        var lines = csv.split('\n');

        var result = [];

        var headers = lines[0].split(',');

        for (var i = 1; i < lines.length; i++) {
            var obj = {};
            var currentline = lines[i].split(',');

            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }

            result.push(obj);
        }

        //return result; //JavaScript object
        return JSON.stringify(result); //JSON
    }

    fileOnChange(event) {
        console.log('fileOnChange', event.target.files[0]);
        const file = event.target.files[0];
        this.setState({
            jsonIput: null,
            enableExport: false
        });

        this.fileSelected = null;

        if (file) {
            this.readFileAsText(file);
            this.fileSelected = file;
            this.fileName = file.name;
        }
    }

    readFileAsText(fileToRead) {
        const reader = new FileReader();
        // Read file into memory as UTF-8
        reader.readAsText(fileToRead);
        // Handle errors load
        reader.onload = this.loadHandler.bind(this);
        reader.onerror = this.errorHandler.bind(this);
    }

    errorHandler(event) {
        if (event.target.error && event.target.error.name == 'NotReadableError') {
            console.log("Canno't read file !");
        }
    }

    loadHandler(event) {
        const target = event.target;
        const contentRaw = target.result;
        if (contentRaw) {
            try {
                const content = this.csvJSON(contentRaw);
                console.log({ target, fileSelected: this.fileSelected });
                const jsonIput = JSON.parse(content);
                this.jsonIput = jsonIput;
                this.enableExport = true;
                
                console.log({ jsonIput });
                this.setState({
                    enableExport: true,
                    jsonIput
                });
            } catch (error) {
                console.log({ error });
                this.setState({
                    enableExport: false
                });
            }
        }
    }

    renderFileInfo() {
        if (!this.state.enableExport) return null;
        return (
            <div id="file-info">
                <div className="file-name">{this.fileSelected ? this.fileSelected.name : ''}</div>
            </div>
        );
    }

    renderThs(item, index, keyPrefix = '') {
        let ths = [];
        Object.keys(item||{}).forEach((key, i) => {
            ths.push(
                <th key={`${keyPrefix}item-th-${index}-${i}`} className={`item-${i} item-th-${i}`}>
                    <span>{key}</span>
                </th>
            );
        });
        return ths;
    }

    renderTds(item, index, keyPrefix = '') {
        let tds = [];
        Object.keys(item).forEach((key, i) => {
            tds.push(
                <td key={`${keyPrefix}item-td-${index}-${i}`} className={`item-${i} item-td-${i}`}>
                    <span>{item[key]}</span>
                </td>
            );
        });
        return tds;
    }

    addToObject(obj, { key, value }, index) {
        // Create a temp object and index variable
        let temp = {};
        let i = 0;

        // Loop through the original object
        for (let prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                // If the indexes match, add the new item
                if (i === index && key && value) {
                    temp[key] = value;
                }

                // Add the current item in the loop to the temp obj
                temp[prop] = obj[prop];

                // Increase the count
                i++;
            }
        }

        // If no index, add to the end
        if (!index && key && value) {
            temp[key] = value;
        }

        return temp;
    }

    groupDataByKey(data = [], key = '') {}

    filterData(data) {
        const mmLateOnTime = moment(LATE_ON_TIME, 'HH:mm:ss');
        let dataByDate = {};
        data.forEach((item, index) => {
            let keyDate = item['Date'];
            if (keyDate) {
                if (!dataByDate[keyDate]) {
                    dataByDate[keyDate] = [];
                }
                dataByDate[keyDate].push(item);
            }
        });
        let dataByDateByUser = {};
        Object.keys(dataByDate).forEach((keyDate, index) => {
            const items = dataByDate[keyDate];
            if (!dataByDateByUser[keyDate]) {
                dataByDateByUser[keyDate] = {};
            }
            items.forEach((item) => {
                let userId = item['User ID'];
                if (!dataByDateByUser[keyDate][userId]) {
                    dataByDateByUser[keyDate][userId] = [];
                }
                dataByDateByUser[keyDate][userId].push(item);
            });
        });
        let dataDsDiTreByDate = {};
        let dataDsDiTreByUser = {};
        console.log({ dataByDateByUser });
        Object.keys(dataByDateByUser).forEach((keyDate, index) => {
            const dateItems = dataByDateByUser[keyDate];

            if (!dataDsDiTreByDate[keyDate]) {
                dataDsDiTreByDate[keyDate] = [];
            }
            Object.keys(dateItems).forEach((uid, uindex) => {
                const userItems = dateItems[uid] || [];

                const firstItem = userItems[0];

                if (firstItem) {
                    let time = moment(firstItem['Time'], 'HH:mm:ss');
                    const mmDate = moment(keyDate);
                    const ym = mmDate.format('YYYY-MM');
                    const dayOfWeekIso = mmDate.format('E');
                    // skip saturday and sunday
                    if (!['6', '7'].includes(dayOfWeekIso)) {
                        if (mmLateOnTime.diff(time) <= 0) {
                            const newItem = this.addToObject(
                                firstItem,
                                {
                                    key: 'day',
                                    value: mmDate.format('dddd')
                                },
                                2
                            );
                            dataDsDiTreByDate[keyDate].push(newItem);
                            if (!dataDsDiTreByUser[ym]) {
                                dataDsDiTreByUser[ym] = {};
                            }

                            if (dataDsDiTreByUser[ym][uid]) {
                                dataDsDiTreByUser[ym][uid]['total'] = dataDsDiTreByUser[ym][uid]['total'] + 1;
                                dataDsDiTreByUser[ym][uid]['date'].push(firstItem['Date']);
                            } else {
                                const newItem2 = {
                                    'User ID': firstItem['User ID'],
                                    name: firstItem['Name'],
                                    total: 1,
                                    date: [firstItem['Date']]
                                };
                                dataDsDiTreByUser[ym][uid] = newItem2;
                            }
                        }
                    }
                }
            });
        });
        return { dataDsDiTreByDate, dataDsDiTreByUser };
    }

    renderDSDiTre() {
        let data = [];
        if (!this.state.jsonIput) return null;
        data = this.state.jsonIput || [];
        const { dataDsDiTreByDate, dataDsDiTreByUser } = this.filterData(data);
        console.log({ dataDsDiTreByDate, dataDsDiTreByUser });
        data = dataDsDiTreByDate;
        const dataFull = [];
        let theadArr = null;
        let bodyArr = [];
        Object.keys(data).forEach((date, i) => {
            const items = data[date];
            if (!theadArr && items[0]) {
                theadArr = <tr key={`item-thead-${date}-${i}`}>{this.renderThs(items[0], i, 'tables-2')}</tr>;
            }
            items.forEach((item, index) => {
                dataFull.push(item);
                let tr = <tr key={`item-${date}-${index}`}>{this.renderTds(item, index, 'tables-2')}</tr>;
                bodyArr.push(tr);
            });
        });
        this.dataDsDiTre = dataFull;
        console.log({ dataFull });
        let theadArr2 = null,
            bodyArr2 = [],
            dataTopDiTre = [];
        Object.keys(dataDsDiTreByUser).forEach((ym, index) => {
            const users = orderBy(dataDsDiTreByUser[ym], 'total', 'desc');
            Object.keys(users).forEach((userId, index) => {
                const userData = users[userId];
                if(userData){
                    userData.date = userData.date.join(';');
                    if (!theadArr2) {
                        theadArr2 = <tr key={`table2-item-thead-${userId}-${index}`}>{this.renderThs(userData, index)}</tr>;
                    }
                    let tds = this.renderTds(userData, index, 'table2-');
                    const tr = <tr key={`tbody-2-tr-${index}`}>{tds}</tr>;
                    bodyArr2.push(tr);
                    dataTopDiTre.push(userData);
                }
            });
        });
        this.dataTopDiTre = dataTopDiTre;

        return (
            <Row>
                <Col>
                    <div className="data-table card">
                        <table className="table1">
                            <thead>{theadArr}</thead>
                            <tbody>{bodyArr}</tbody>
                        </table>
                    </div>
                </Col>
                <Col>
                    <div className="data-table card">
                        <table className="table2">
                            <thead>{theadArr2}</thead>
                            <tbody>{bodyArr2}</tbody>
                        </table>
                    </div>
                </Col>
            </Row>
        );
    }

    convertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';

        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '') line += ',';

                line += array[i][index];
            }

            str += line + '\r\n';
        }

        return str;
    }

    exportCSVFile(items, fileTitle) {
        var headers = {};
        Object.keys(items[0]).forEach((key) => {
            headers[key] = key;
        });
        items.unshift(headers);
        // Convert Object to JSON
        var jsonObject = JSON.stringify(items);

        var csv = this.convertToCSV(jsonObject);

        var exportedFileName = fileTitle + '_download.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, exportedFileName);
    }

    onCopy() {
        let arr = this.fileName.split('.');
        arr.pop();
        let fileName = arr.join('');
        this.exportCSVFile(this.dataDsDiTre, fileName + '_list');
        this.exportCSVFile(this.dataTopDiTre, fileName + '_top');
    }
}
