import React from 'react';
import { View } from 'framework7-react';

export default class extends React.Component {

    render() {
        return <View id="main-view" url="/" main />;
    }
    onPageBeforeIn() {
        // do something on page before in
    }
    onPageInit() {
        // do something on page init
    }
}
