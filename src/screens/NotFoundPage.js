import React from 'react';
import { Page, Navbar,List,ListItem } from 'framework7-react';

export default () => (
  <Page>
    <Navbar title="My Page" />
    <List>
      <ListItem title="Item 1" />
      <ListItem title="Item 2" />
    </List>
  </Page>
);