#include <bits/stdc++.h>
using namespace std;

int main() {
    int T;
    cin >> T;
    while( T-- ) {
        int discount , Cost , Have;
        int ans =0;
        cin >> discount >> Cost >> Have;
        
         if(Have >= Cost) {
            cout << 0 << endl; continue;
        }
            
        int after;
        int temp = Have;
        while(Have >= 0 ) {
            std::cout << Have <<"  "<< std::endl;
            Have--;
            after = (Cost * discount);
            if(after <= Have*100) {
                ans = temp - Have;
                break;
            }
            else if(after > Have*100 and Have == 0) {
                cout << -1 << endl; continue;
            }
            discount += discount;
        }
            cout << ans << endl; continue;
    }
    return 0;
}
