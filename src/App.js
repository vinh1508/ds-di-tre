import React from 'react';
import { App, View, Statusbar } from 'framework7-react';
import MainView from './screens/MainView';
import DataTransfer from './services/DataTransfer';

import routes from './routes';

export default class MainApp extends React.Component {
    
    componentDidMount() {
        this.$f7ready && this.$f7ready((f7) => {
            window.f7 = f7;
            f7.on('routeChange', (newRoute, previousRoute, router) => {
                this.onRouterChange(newRoute, previousRoute, router);
            });
            DataTransfer.F7App = f7;
        });
    }
    onRouterChange(newRoute, previousRoute, router) {
        console.log(newRoute, previousRoute, router);
    }

    render() {
        const f7params = {
            id: 'jp.co.omron.healthcare.riskreport', // App bundle ID
            name: 'Risk Report', // App name
            theme: 'ios', // Automatic theme detection
            routes
        };
        return (
            <App params={f7params}>
                {/* Statusbar */}
                <Statusbar />
                {/* Main View */}
                <MainView />
            </App>
        );
    }
}
