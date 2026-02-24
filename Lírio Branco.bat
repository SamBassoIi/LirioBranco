@echo off
:: Tenta abrir no Chrome em modo aplicativo (sem barra de pesquisa)
start chrome --app="file:///%~dp0index.html"

:: Se o computador não tiver Chrome, ele tenta abrir no navegador padrão
if %ERRORLEVEL% neq 0 start index.html

exit