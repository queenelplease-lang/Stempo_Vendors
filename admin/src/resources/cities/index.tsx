import {
  List,
  Datagrid,
  TextField,
  EditButton,
  ShowButton,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  Create,
  required,
} from 'react-admin';

export const CityList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="slug" />
      <TextField source="latitude" />
      <TextField source="longitude" />
      <EditButton />
      <ShowButton />
    </Datagrid>
  </List>
);

export const CityShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="slug" />
      <TextField source="latitude" />
      <TextField source="longitude" />
    </SimpleShowLayout>
  </Show>
);

export const CityEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="slug" validate={required()} />
      <NumberInput source="latitude" />
      <NumberInput source="longitude" />
    </SimpleForm>
  </Edit>
);

export const CityCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" validate={required()} />
      <TextInput source="slug" />
      <NumberInput source="latitude" />
      <NumberInput source="longitude" />
    </SimpleForm>
  </Create>
);
