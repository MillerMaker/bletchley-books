import { useNavigate, useLocation } from "react-router"
import backButton from "../assets/back_arrow_icon.png";
import './Help.css'


interface Props {
    backPath: String;
}

function Help (props: Props) {
    const navigate = useNavigate(); 
    const location = useLocation(); 

    function handleBack() {
        location.hash = '';
        console.log(props.backPath)
       //navigate('' + props.backPath); 
    }
    return (
        <>
        <div className = "banner">
            <div className = "back"  onClick= {() => {navigate("../chart-of-accounts")}}>
                <img src = {backButton} className = "backIcon"/>
                Back
            </div>
            <div className ="account-name">
                Help
            </div>
        </div>
        <div className="info">
        <div id="list-example" className="list-group">
  <a className="list-group-item list-group-item-action" href="#list-item-1">Dashboard</a>
  <a className="list-group-item list-group-item-action" href="#list-item-2">Accounts Features</a>
  <a className="list-group-item list-group-item-action" href="#list-item-3">Journal Features</a>
  <a className="list-group-item list-group-item-action" href="#list-item-4">Event Log</a>
  <a className="list-group-item list-group-item-action" href="#list-item-5">Administrator Tools</a>
</div>
<div data-spy="scroll" data-target="#list-example" data-offset="0" className="scrollspy-example">
  <h4 id="list-item-1">Dashboard</h4>
  <p>The dashboard is the first page that users see upon entering the Bletchley Books program. To return to the dashboard from any screen, simply click the Bletchley Books icon in the top left corner of the screen. This page stores three different types of information: Financial ratios, Pending Journals, and Pending users for administrator users. </p>
  <b>Financial Ratios </b> <p> Displays the following financial ratios: Current Ratio, Cash Ratio, Receivables Turnover, Inventory Turnover, Debt Ratio, Debt-To-Equity-Ratio, Return on Assets, Gross Profit Margin. These ratios are calculated in real time, and are color coordinated based on the following parameters:</p>
  <b>Pending Journal Entries </b> <p> Displays a list of all pending journal entries that have not been approved or rejected. To review a journal entry, select the journal entry and click the “view” button. This will redirect you to the journal entry page.</p>
  <b>Pending Users (Admins only)</b> <p> To add a new account, simply select the “Create Account button located at the bottom of the General Ledger. Note that if you decide to enter an initial balance, you must also make an associated journal entry or account to reciprocate that balance. </p>

  <h4 id="list-item-2">Accounts Features</h4>
  <p>The accounts page is where users can interact with the list of accounts currently within the system. From this page users can search, filter, and view existing accounts, create, and edit new accounts, as well as deactivate accounts. This page also includes several key tools, including an email feature, calendar, and the financial reports button.</p>
  <b>General Ledger </b> <p> The focal point of the accounts page is the general ledger. This is a comprehensive list of every account on the system, sorted by number. To view an account, simply click the name of the account. To edit or deactivate the account, highlight the entry, and select the appropriate action. Use the drop down next to the search bar to change the search type. Users may search by name, number, category, subcategory, balance, or statement.</p>
  <b>Adding Accounts</b> <p> To add a new account, simply select the “Create Account button located at the bottom of the General Ledger. Note that if you decide to enter an initial balance, you must also make an associated journal entry or account to reciprocate that balance. </p>
  <b>Financial Statements</b> <p> To navigate to the financial statements tool, simply click the clipboard icon in the toolbar at the top right of the screen. Bletchley Books supports four types of financial statements: Trial balance, Balance Statements, Income Statements, and Retained Earnings. </p>
  <b>System Email</b> <p>To view the email list, simply click the envelope icon in the toolbar at the top right of the screen. This tool contains a list of all the current users and their respective roles. To compose an email, simply select the user, enter a subject and body, and click “send”.</p>
  <b>Calendar</b> <p> To view the calendar, simply click the calendar icon in the toolbar at the top right of the screen. </p>

  <h4 id="list-item-3">Journal Features</h4>
  <b>Journal List</b> <p>The focal point of the journal page is the journal list. This is a comprehensive list of every journal on the system, sorted by date. To approve or reject a pending account, simply highlight the entry, and select “approve” or “reject”. Use the drop down next to the search bar to change the search type. Users may search by name, number, category, subcategory, balance, or statement.</p>
  <b>Adding Journal Entries</b> <p>To add a new journal entry, simply select the “Create Journal Entry” button located at the top of the journal list. You may provide an optional description or attach a document. To correctly enter a journal entry, you must have a minimum of two transactions. The amounts for each of these transactions must be positive, and each journal entry must have at least one debit and credit transaction. If the journal entry is an adjusting journal, check the “adjusting journal entry” checkbox.  Every journal entry once submitted must be approved by an admin or manager account. Unapproved accounts appear with a status of “pending”.</p>


  <h4 id="list-item-4">Event Log</h4>
  <p>The Event Log page stores every transaction that takes place on the system. This includes the creation and verification of users, as well as the creation of new accounts on the accounts page. Events are sorted by date. To view an entry, simply click the “View” button on the right side of the event entry. Account events include the name of the account, the new balance, and a snapshot of information about the account. Similarly, a new user event will contain the user’s username, and the administrator that approved or rejected the new user. </p>
  <h4 id="list-item-5">Administrator Tools</h4>
  <p>The administrator tools are found under the admin home page. This page includes buttons to access the password report, user verification, and general user management pages. </p>
  <b>User Management Tools</b> <p>This page contains a comprehensive list of every user account on the system, sorted alphabetically by name. To edit a user, simply click the table row of the user. This will display the available tools. You can edit the user’s information, deactivate the user, change role, email, and suspend the user. To create a user, simply select the “Create User” page at the top of the screen. After filling in the information and creating the account, this user will be submitted for verification, so you must go to the user verification page before the account is activated.  </p>
  <b>Password Report</b> <p>When a user account is created or a password is changed, the password is assigned an expiration date 12 months from the original date of creation. The password report page lists the password expiration dates for all active users. To notify users that their password is expiring soon, select the user and click “notify” this will bring up an email page so that you can compose an email to this user. </p>
  <b>User Verification</b> <p>When a user account is created, the user must be approved. This page displays a list of all of the users awaiting approval. Use the accept and reject buttons below the list to accept or reject a user. </p>
</div>

</div>
        </>
    )

}

export default Help; 