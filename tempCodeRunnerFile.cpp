#include <bits/stdc++.h>
#define min(x,y) ((y)^(((x)^(y))&(-((x)<(y)))))
#define max(x,y) ((x)^(((x)^(y))&(-((x)<(y)))))
using namespace std;
int main(){
    #ifndef ONLINE_JUDGE
        //#define FILE_OUTPUT
        #ifdef FILE_OUTPUT
        freopen(".in","r",stdin);
        freopen(".out","w",stdout);
        #endif
        long long c1=clock();
    #endif
    int cnt=0;
    for(int a=1;a<=4;a++)
    for(int b=1;b<=4;b++)
    for(int c=1;c<=4;c++)
    for(int d=1;d<=4;d++)if(a!=b&&a!=c&&a!=d&&b!=c&&b!=d&&c!=d&&(a==1+b!=1+c==2+d!=4)==1)cnt++;
    printf("%d",cnt);
    /*#ifndef ONLINE_JUDGE
        #ifndef FILE_OUTPUT
        puts("\n--------------------------------");
        printf("Process exited after %g seconds with return value 0\n",(clock()-c1)/1000.0);
        system("pause");
        #endif
    #endif*/
    return 0;
}