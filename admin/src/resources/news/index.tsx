import {
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  EditButton,
  ShowButton,
  DeleteButton,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  BooleanInput,
  Create,
  required,
} from 'react-admin';

export const NewsList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="title" />
      <BooleanField source="published" />
      <DateField source="publishedAt" showTime />
      <DateField source="createdAt" showTime />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export const NewsShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="content" />
      <TextField source="imageUrl" />
      <BooleanField source="published" />
      <DateField source="publishedAt" showTime />
      <DateField source="createdAt" showTime />
      <DateField source="updatedAt" showTime />
    </SimpleShowLayout>
  </Show>
);

export const NewsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="title" validate={required()} fullWidth />
      <TextInput source="content" multiline fullWidth validate={required()} />
      <TextInput source="imageUrl" fullWidth />
      <BooleanInput source="published" />
    </SimpleForm>
  </Edit>
);

export const NewsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="title" validate={required()} fullWidth />
      <TextInput source="content" multiline fullWidth validate={required()} />
      <TextInput source="imageUrl" fullWidth />
      <BooleanInput source="published" defaultValue={true} />
    </SimpleForm>
  </Create>
);
