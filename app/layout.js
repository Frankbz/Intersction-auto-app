import "@styles/globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import Provider from "@context/provider";

import Navbar from "@components/Navbar";

export const metadata = {
  title: "NYCDOT Automation App",
  description: "Transfer pin on google map to corrdinates coloum in excel",
};

const RootLayout = ({ children }) => (
  <html lang='en'>
    <Provider>
      <body>
        <div className="container-fluid">
          <Navbar />
          <main>
            {children}
          </main>
        </div>
      </body>
    </Provider>
  </html>
);

export default RootLayout;