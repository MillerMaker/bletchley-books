import ChartAccounts from '../components/ChartAccounts'
import Header from '../components/Header'


function ChartAccountsPage() {
    return (
        <>
            <Header title="Chart of Accounts" homePath="/private-outlet/chart-of-accounts" />
            <ChartAccounts />
        </>
    )

}

export default ChartAccountsPage