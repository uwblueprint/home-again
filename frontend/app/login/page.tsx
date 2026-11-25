import LoginForm from "@/app/login/components/LoginForm";
import {
  PASSWORD_RESET_QUERY_KEY,
  PASSWORD_RESET_QUERY_SUCCESS,
} from "@/common/constants/AuthConstants";

/** Agent portal sign-in UI. Auth wiring lands in a later ticket. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const passwordReset =
    params[PASSWORD_RESET_QUERY_KEY] === PASSWORD_RESET_QUERY_SUCCESS;

  return <LoginForm passwordReset={passwordReset} />;
}
