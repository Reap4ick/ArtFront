// import MainLayout from './components/containers/default';
import Authorr from './components/authorview'
import { Route, Routes } from 'react-router-dom';
import MainLayout from './components/containers/default';
import HomePage from './components/home';
import PostsPage from './components/posts'
import Setting from './components/Setting'
import Profile from './components/Profile'
import Update from './components/Update'
import AddWork from './components/AddWork'
import Messenger from './components/Messenger'
import AboutArtUA from './components/about';
import Artists from './components/artists';
import Policies from './components/policies';
import Customers from './components/customers';


export default function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="authorview" element={<Authorr />} />
                <Route path="product/:id" element={<Authorr />} />
                <Route path="profile" element={<Profile />} />
                <Route path="AddWork" element={<AddWork />} />
                <Route path="Update/:id" element={<Update />} />
                <Route path="Setting" element={<Setting />} />
                <Route path="Messenger" element={<Messenger />} />
                <Route path="AboutArtUA" element={<AboutArtUA />} />
                <Route path="Artists" element={<Artists />} />
                <Route path="Policies" element={<Policies />} />
                <Route path="customers" element={<Customers />} />


            </Route>
        </Routes>
    );
}
