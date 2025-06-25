import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
} from "ui-library";
import { Library } from "lucide-react";
import useAuth from "../../context/useAuth";

const AccountRow = ({ account, level = 0, formatCurrency }) => {
  const { t } = useTranslation();
  const isParent = !account.parentId;

  return (
    <TableRow className={isParent ? "bg-slate-800/50" : ""}>
      <TableCell style={{ paddingLeft: `${1 + level * 1.5}rem` }}>
        <Link
          to={`/accounting/ledger/${account._id}`}
          className="font-medium text-indigo-400 hover:underline"
        >
          {account.name}
        </Link>
        {account.isSystemAccount && (
          <Badge variant="secondary" className="ml-2">
            System
          </Badge>
        )}
      </TableCell>
      <TableCell>{account.code}</TableCell>
      <TableCell>{account.type}</TableCell>
      <TableCell>{account.subType}</TableCell>
      <TableCell className="text-right font-mono">
        {formatCurrency(account.balance)}
      </TableCell>
    </TableRow>
  );
};

const AccountList = ({ accounts = [] }) => {
  const { t } = useTranslation();
  const { formatCurrency } = useAuth();

  // Helper to build a hierarchical structure
  const buildHierarchy = (accs) => {
    const accountMap = new Map(
      accs.map((a) => [a._id, { ...a, children: [] }])
    );
    const roots = [];

    for (const account of accs) {
      if (account.parentId && accountMap.has(account.parentId)) {
        accountMap
          .get(account.parentId)
          .children.push(accountMap.get(account._id));
      } else {
        roots.push(accountMap.get(account._id));
      }
    }
    return roots;
  };

  const hierarchicalAccounts = buildHierarchy(accounts);

  const renderAccountRows = (accs, level = 0) => {
    return accs.map((account) => (
      <React.Fragment key={account._id}>
        <AccountRow
          account={account}
          level={level}
          formatCurrency={formatCurrency}
        />
        {account.children.length > 0 &&
          renderAccountRows(account.children, level + 1)}
      </React.Fragment>
    ));
  };

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <Library className="mx-auto h-12 w-12" />
        <h3 className="mt-2 text-lg font-semibold">
          {t("account_list.no_accounts_title", "No Accounts Found")}
        </h3>
        <p className="mt-1 text-sm">
          {t(
            "account_list.no_accounts_subtitle",
            "Get started by creating a new financial account."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {t("account_list.header_name", "Account Name")}
            </TableHead>
            <TableHead>{t("account_list.header_code", "Code")}</TableHead>
            <TableHead>{t("account_list.header_type", "Type")}</TableHead>
            <TableHead>
              {t("account_list.header_subtype", "Sub-Type")}
            </TableHead>
            <TableHead className="text-right">
              {t("account_list.header_balance", "Balance")}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{renderAccountRows(hierarchicalAccounts)}</TableBody>
      </Table>
    </div>
  );
};

export default AccountList;
