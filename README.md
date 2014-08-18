JavaScript_SOAP_Client
======================

A JavaScript SOAP Client based on Code by Matteo Casati - http://www.guru4.net/

DEMO 1: "Hello World!"
----------------------

The simplest example you can imagine (but maybe not the most fanciful...):


*Client (javascript)*
```javascript
function HelloWorld()
{
    var parameters = new SOAPClientParameters();
    SOAPClient.invoke(url, 'HelloWorld', parameters, true, HelloWorld_callBack);
}
function HelloWorld_callBack(response)
{
    alert(response);
}
```
*Server (WebMethod - C#)*
```csharp
public string HelloWorld()
{
    return "Hello World!";
}
```

DEMO 2: Using parameters (base)
-------------------------------

Passing parameters to the Web Service (see also DEMO 12):

*Client (javascript)*
```javascript
function HelloTo()
{
    var parameters = new SOAPClientParameters();
    parameters.add('name', document.frmDemo.txtName.value);
    SOAPClient.invoke(url, 'HelloTo', parameters, true, HelloTo_callBack);
}
function HelloTo_callBack(response)
{
    alert(response);
}
```
*Server (WebMethod - C#)*
```csharp
public string HelloTo(string name)
{
    return String.Format("Hello {0}!", name);
}
```

DEMO 3: Using .NET framework core classes
-----------------------------------------

Using a date as return type (.NET "DateTime" automatically converted to JavaScript "Date")

*Client (javascript)*
```javascript
function ServerTime()
{
    var parameters = new SOAPClientParameters();
    SOAPClient.invoke(url, 'ServerTime', parameters, true, ServerTime_callBack);
}
function ServerTime_callBack(st)
{
    var ct = new Date();
    alert('Server: ' + st.toLocaleString() + "\r\n[Client: " + ct.toLocaleString() + ']');
}
```
*Server (WebMethod - C#)*
```csharp
public DateTime ServerTime()
{
    return DateTime.Now;
}
```

DEMO 4: Void methods
--------------------

Calling a void method with a long response-time (while waiting for the response an orange box is displayed):

*Client (javascript)*
```javascript
function Wait()
{
    var duration = parseInt(document.frmDemo.ddSleepDuration[document.frmDemo.ddSleepDuration.selectedIndex].value, 10);
    var parameters = new SOAPClientParameters();
    parameters.add('seconds', duration);
    var img = document.getElementById('phWait');
    img.hidden = false;
    SOAPClient.invoke(url, 'Wait', parameters, true, Wait_callBack);
}
function Wait_callBack(r)
{
    var img = document.getElementById('phWait');
    img.hidden = true;
    alert('Call to "Wait" method completed');
}
```
*Server (WebMethod - C#)*
```csharp
public void Wait(int seconds)
{
    System.Threading.Thread.Sleep(seconds * 1000);
    return;
}
```

DEMO 5: Exceptions
------------------

Handling exceptions:

*Client (javascript)*
```javascript
function ThrowException()
{
    try
    {
        var parameters = new SOAPClientParameters();
        SOAPClient.invoke(url, 'ThrowException', parameters, false);
    }
    catch(e)
    {
        alert('An error has occured! ' + e);
    }
}
function ThrowExceptionAsync()
{
    var parameters = new SOAPClientParameters();
    SOAPClient.invoke(url, 'ThrowException', parameters, true, ThrowExceptionAsync_callBack);
}
function ThrowExceptionAsync_callBack(e)
{
    if(e typeof Error) {
        alert("An error has occured!\r\n\r\n" + e.description + "\r\n\r\n[Error code: " + e.number + ']');
    }
}
```
*Server (WebMethod - C#)*
```csharp
public void ThrowException(int seconds)
{
    throw new Exception();
}
```

DEMO 6: Sync calls
------------------

Syncronous call example: server response is delayed 5 seconds using "Wait" method (see demo No. 4). Please note that browser is stuck until response is received:

*Client (javascript)*
```javascript
function SyncSample()
{
    var parameters = new SOAPClientParameters();
    parameters.add('seconds', 5);
    var starttime = (new Date).toLocaleTimeString();
    var response = SOAPClient.invoke(url, 'Wait', parameters, false);
    alert('Operation start time: ' + starttime + "\r\nOperation end time: " + (new Date).toLocaleTimeString());
}
```
*Server (WebMethod - C#)*
```csharp
public void Wait(int seconds)
{
    System.Threading.Thread.Sleep(seconds * 1000);
    return;
}
```

DEMO 7: Using custom entities (classes)
---------------------------------------

Leaving the textbox empty, the web method will return a null; entering any value a User object with random property values will be returned:

*Client (javascript)*
```javascript
function GetUser()
{
    var username = document.frmDemo.txtUsername.value;
    var parameters = new SOAPClientParameters();
    parameters.add('username', username);
    SOAPClient.invoke(url, 'GetUser', parameters, true, GetUser_callBack);
}
function GetUser_callBack(u)
{
    if(u == null) {
        alert("No user found.\r\n\r\nEnter a username and repeat search.");
    } else {
        alert(
            'ID: ' + u.Id + "\r\n" +
            'USERNAME: ' + u.Username + "\r\n" +
            'PASSWORD: ' + u.Password + "\r\n" +
            'EXPIRATION: ' + u.ExpirationDate.toLocaleString());
    }
}
```
*Server (WebMethod - C#)*
```csharp
public User GetUser(string username)
{
    if (username.Trim().Length == 0) {
        return null;
    }
    int id = DateTime.Now.Millisecond;
    string password = "PWD_" + DateTime.Now.Ticks.ToString();
    DateTime expirationdate = DateTime.Now.Add(new TimeSpan(1, 0, 0, 0));
    return new User(id, username, password, expirationdate);
}

User class:
[Serializable]
public class User
{
    private int _id = -1;
    private string _username = "";
    private string _password = "";
    private DateTime _expirationdate = DateTime.MinValue;
    public User() { }
    public User(int id, string username, string password, DateTime expirationdate)
    {
        this.Id = id;
        this.Username = username;
        this.Password = password;
        this.ExpirationDate = expirationdate;
    }
    public int Id
    {
        get { return _id; }
        set { _id = value; }
    }
    public string Username
    {
        get { return _username; }
        set { _username = value; }
    }
    public string Password
    {
        get { return _password; }
        set { _password = value; }
    }
    public DateTime ExpirationDate
    {
        get { return _expirationdate; }
        set { _expirationdate = value; }
    }
}
```
