# Software Installation

[Choco](https://chocolatey.org/) is a package manager for windows applications, similar to NPM, or RPM, or Yum, etc

From a DOS Command prompt running as Administrator, execute the following command
```
@"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -InputFormat None -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
```
Once Choco finishes installing you can install various other packages with a single line
```
C:\> choco install consolez
C:\> choco install git.install
C:\> choco install nodejs
```

