import UserGoalsForm from "../components/UserGoalsForm";
import RequireLogin from "../components/RequireLogin";

export default function GoalsPage() {
  return (
    <RequireLogin>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center py-10">
        <UserGoalsForm />
      </div>
    </RequireLogin>
  );
}
