"use client";

import { createBooks } from "@/action/create-books";
import { createAccounts } from "@/action/create-accounts";
import { Button } from "@/components/ui/button";
import { createTransactions } from "@/action/create-transactions";
import { toast } from "sonner";
import { createCategories } from "@/action/create-categories";

export default function Home() {
  const handleCreateAccounts = async () => {
    await createAccounts();
    toast.success("Accounts created successfully");
  };
  const handleCreateCategories = async () => {
    await createCategories();
    toast.success("Categories created successfully");
  };
  const handleCreateBooks = async () => {
    await createBooks();
    toast.success("Books created successfully");
  };
  const handleCreateTransactions = async () => {
    await createTransactions();
    toast.success("Transactions created successfully");
  };

  return (
    <div className="p-4">
      <p className="">Create Sample API</p>
      <div className="flex gap-4">
        <Button onClick={handleCreateAccounts}>Create Accounts</Button>
        <Button onClick={handleCreateCategories}>Create Categories</Button>
        <Button onClick={handleCreateBooks}>Create Books</Button>
        <Button onClick={handleCreateTransactions}>Create Transactions</Button>
      </div>
    </div>
  );
}
