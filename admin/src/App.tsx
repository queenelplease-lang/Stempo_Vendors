import React from 'react';
import { Admin, Resource } from 'react-admin';
import { dataProvider } from './dataProvider';
import { authProvider } from './authProvider';
import { NewsList, NewsEdit, NewsShow, NewsCreate } from './resources/news';
import { RestaurantList, RestaurantEdit, RestaurantShow } from './resources/restaurant';
import { BonusProgramList, BonusProgramEdit, BonusProgramShow, BonusProgramCreate } from './resources/bonusPrograms';
import { CityList, CityEdit, CityShow, CityCreate } from './resources/cities';
import { Dashboard } from './components/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocationCityIcon from '@mui/icons-material/LocationCity';

function App() {
  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      dashboard={Dashboard}
    >
      <Resource
        name="news"
        list={NewsList}
        create={NewsCreate}
        edit={NewsEdit}
        show={NewsShow}
        icon={ArticleIcon}
        options={{ label: 'News' }}
      />
      <Resource
        name="restaurant"
        list={RestaurantList}
        edit={RestaurantEdit}
        show={RestaurantShow}
        icon={StorefrontIcon}
        options={{ label: 'Restaurant' }}
      />
      <Resource
        name="bonus-programs"
        list={BonusProgramList}
        create={BonusProgramCreate}
        edit={BonusProgramEdit}
        show={BonusProgramShow}
        icon={CardGiftcardIcon}
        options={{ label: 'Programs' }}
      />
      <Resource
        name="cities"
        list={CityList}
        edit={CityEdit}
        show={CityShow}
        create={CityCreate}
        icon={LocationCityIcon}
      />
    </Admin>
  );
}

export default App;
