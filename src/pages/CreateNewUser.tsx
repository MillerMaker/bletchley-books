
import Header from "../components/Header";
import NewUser from "../components/NewUser";
import { UserDoc } from "../firebase";


function CreateNewUser() {

    return (
      <>
            <Header homePath="/" title="Create User" />
            <NewUser createType="create" defaultUserDoc={new UserDoc("",null)} />
      </>
    )
}

export default CreateNewUser;