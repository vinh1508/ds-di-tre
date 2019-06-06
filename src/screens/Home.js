import React from 'react';
import { Block, BlockTitle, Navbar, NavTitle, Page, Button } from 'framework7-react';
import API from '../services/API';
import ReportExport from '../components/ReportExport';
import DataTransfer from '../services/DataTransfer';
import moment from 'moment';
import './Home.scss';

export default class extends React.Component {
    state = {
        fileSelected: null,
        jsonIput: null,
        enableExport: false
    };
    fileSelected = null;
    
    render() {
        return (
            <Page id="Page-Home">
                <Navbar>
                    <NavTitle>Risk Report Generator</NavTitle>
                </Navbar>

                <Block strong>
                    <label id="lblChooseFile">
                        Choose a json file ...
                        <input type="file" id="fileInput" accept=".csv" onChange={this.fileOnChange.bind(this)} />
                    </label>
                    {this.renderFileInfo()}
                </Block>
                <Block strong>
                    <Button fill onClick={this.onCopy.bind(this)}>
                        Download CSV
                    </Button>
                </Block>
                <Block id="items">{this.renderReportExport()}</Block>
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

    export() {}

    reportOnCompleted(data) {
        console.log('reportOnCompleted::::', data);
        const svg_content = data.svg;
        const file = new Blob([svg_content], { type: 'image/svg+xml' });
        const formData = new FormData();
        formData.append('svg-file', file, 'fileName.svg');
        formData.append('description', 'description report');
        API.report(formData).then((res) => {
            console.log('res', res);
        });
    }
    renderFileInfo() {
        if (!this.state.enableExport) return null;
        return (
            <div id="file-info">
                <div className="file-name">{this.fileSelected ? this.fileSelected.name : ''}</div>
            </div>
        );
    }

    renderThs(item, index) {
        let ths = [];
        Object.keys(item).forEach((key, i) => {
            ths.push(<th key={`item-th-${index}-${i}`}>{key}</th>);
        });
        return ths;
    }

    renderTds(item, index) {
        let tds = [];
        Object.keys(item).forEach((key, i) => {
            tds.push(<td key={`item-td-${index}-${i}`}>{item[key]}</td>);
        });
        return tds;
    }
    filterData(data) {
        const onTime = moment('09:00:00', 'HH:mm:ss');
        let dataByDate = {};
        data.forEach((item, index) => {
            if (item['Date']) {
                if (!dataByDate[item['Date']]) {
                    dataByDate[item['Date']] = [];
                }
                dataByDate[item['Date']].push(item);
            }
        });
        let dataByDateByUser = {};
        Object.keys(dataByDate).forEach((date, index) => {
            const items = dataByDate[date];
            if (!dataByDateByUser[date]) {
                dataByDateByUser[date] = {};
            }
            items.forEach((item) => {
                let userId = item['User ID'];
                if (!dataByDateByUser[date][userId]) {
                    dataByDateByUser[date][userId] = [];
                }
                dataByDateByUser[date][userId].push(item);
            });
        });
        let dataByDateByUserFirstCheck = {};
        console.log({ dataByDateByUser });
        Object.keys(dataByDateByUser).forEach((date, index) => {
            const dateItems = dataByDateByUser[date];

            if (!dataByDateByUserFirstCheck[date]) {
                dataByDateByUserFirstCheck[date] = [];
            }
            console.log({ dateItems });
            Object.keys(dateItems).forEach((uid, uindex) => {
                const userItems = dateItems[uid] || [];

                const firstItem = userItems[0];

                if (firstItem) {
                    let firstTime = firstItem['Time'];
                    let time = moment(firstTime, 'HH:mm:ss');
                    if (onTime.diff(time) <= 0) {
                        dataByDateByUserFirstCheck[date].push(firstItem);
                    }
                }
            });
        });
        return dataByDateByUserFirstCheck;
    }
    renderReportExport() {
        let data = [];
        if (!this.state.jsonIput) return null;
        data = this.state.jsonIput || [];
        data = this.filterData(data);
        console.log({ data });
        // return null;
        // Class: "Visitor"
        // Date: "2019-02-11"
        // Employee ID: ""
        // External Device: ""
        // Mode: "Out"
        // Name: ""
        // "Pass Count
        // ": "0
        // "
        // Property: "1000"
        // Result: "Capture Failed"
        // Terminal ID: "0001 : Main Door"
        // Time: "07:44:03"
        // Type: "1:N"
        // User ID: "****"
        const dataFull = [];
        let theadArr = null;
        let bodyArr = [];
        Object.keys(data).forEach((date, i) => {
            const items = data[date];
            if (i === 0) {
                theadArr = <tr key={`item-thead-${date}-${i}`}>{this.renderThs(items[0], i)}</tr>;
            }
            items.forEach((item, index) => {
                dataFull.push(item);
                let tr = <tr key={`item-${date}-${index}`}>{this.renderTds(item, index)}</tr>;
                bodyArr.push(tr);
            });
        });
        this.dataFiltered = dataFull;
        console.log({ dataFull });

        return (
            <table>
                <thead>{theadArr}</thead>
                <tbody>{bodyArr}</tbody>
            </table>
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

        var exportedFilenmae = fileTitle + '_download.csv' || 'export.csv';

        var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        var link = document.createElement('a');
        console.log('link.download', link.download);
        var url = URL.createObjectURL(blob);
        link.className = 'external';
        link.setAttribute('href', url);
        link.setAttribute('download', exportedFilenmae);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    onCopy() {
        this.exportCSVFile(this.dataFiltered, this.fileName);
    }
}
