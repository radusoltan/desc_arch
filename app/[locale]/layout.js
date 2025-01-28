
import "../globals.css";
import i18nConfig from "@/app/i18nConfig"
import { Flowbite } from "flowbite-react"


export const metadata = {
  title: "Deschide MD",
  description: "Portal de stiri din Republica Moldova",
};

export function generateStaticParams() {
  return i18nConfig.locales.map(locale => ({ locale }));
}

export default async function RootLayout(props) {

  const params = await props.params;
  const {
    locale
  } = params;

  const {
    children
  } = props;

  return <Flowbite>
    <html lang={locale} className="h-full bg-gray-100">
    <body className="h-full bg-gray-100" >
    {children}
    </body>
    </html>
  </Flowbite>
}
