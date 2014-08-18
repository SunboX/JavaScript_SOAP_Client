JavaScript SOAP Client
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
    alert('Server: ' + st.toLocaleString() + "\n[Client: " + ct.toLocaleString() + ']');
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
        alert("An error has occured!\n\n" + e.description + "\n\n[Error code: " + e.number + ']');
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
    alert('Operation start time: ' + starttime + "\nOperation end time: " + (new Date).toLocaleTimeString());
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
        alert("No user found.\n\nEnter a username and repeat search.");
    } else {
        alert(
            'ID: ' + u.Id + "\n" +
            'USERNAME: ' + u.Username + "\n" +
            'PASSWORD: ' + u.Password + "\n" +
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
    string password = String.Format("PWD_{0}", DateTime.Now.Ticks);
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

DEMO 8: Arrays
--------------

Using custom entity arrays. The web method returns an array with 4 User objects (see demo No. 7)

*Client (javascript)*
```javascript
function GetUsers()
{
    var parameters = new SOAPClientParameters();
    SOAPClient.invoke(url, 'GetUsers', parameters, true, GetUsers_callBack);
}
function GetUsers_callBack(ul)
{
    alert(ul.length + ' user(s) found:');
    for(var i = 0; i < ul.length; i++)        
        alert(
            'User No. ' + (i + 1) + "\n\n" +
            'ID: ' + ul[i].Id + "\n" +
            'USERNAME: ' + ul[i].Username + "\n" +
            'PASSWORD: ' + ul[i].Password + "\n" +
            'EXPIRATION: ' + ul[i].ExpirationDate.toLocaleString());
}
```
*Server (WebMethod - C#)*
```csharp
public User[] GetUsers()
{
    User[] ul = new User[4];
    Random r = new Random();
    for (int i = 0; i < ul.Length; i++)
    {
        int id = r.Next(100);
        string username = String.Format("USR_{0}", id);
        string password = String.Format("PWD_{0}", id);
        DateTime expirationdate = DateTime.Now.Add(new TimeSpan((i + 1), 0, 0, 0));
        ul[i] = new User(id, username, password, expirationdate);
    }
    return ul;
}
```

DEMO 9: ICollection
-------------------

Custom entity collection (System.Collections.ICollection). The web method returns a UserList object, typed collection of User (see demo No. 7) with 3 elements.

*Client (javascript)*
```javascript
function GetUserList()
{
    var parameters = new SOAPClientParameters();
    SOAPClient.invoke(url, 'GetUserList', parameters, true, GetUserList_callBack);
}
function GetUserList_callBack(ul)
{
    alert(ul.length + ' user(s) found:');
    for(var i = 0; i < ul.length; i++)        
        alert(
            'User No. ' + (i + 1) + "\n\n" +
            'ID: ' + ul[i].Id + "\n" +
            'USERNAME: ' + ul[i].Username + "\n" +
            'PASSWORD: ' + ul[i].Password + "\n" +
            'EXPIRATION: ' + ul[i].ExpirationDate.toLocaleString());
}
```
*Server (WebMethod - C#)*
```csharp
public UserList GetUserList()
{
    UserList ul = new UserList();
    Random r = new Random();
    for (int i = 0; i < 3; i++)
    {
        int id = r.Next(100);
        string username = String.Format("USR_{0}", id);
        string password = String.Format("PWD_{0}", id);
        DateTime expirationdate = DateTime.Now.Add(new TimeSpan((i + 1), 0, 0, 0));
        ul.Add(new User(id, username, password, expirationdate));
    }
    return ul;
}

UserList class:
[Serializable]
public class UserList : System.Collections.CollectionBase
{
    public UserList() { }
    public int Add(User value)
    {
        return base.List.Add(value as object);
    }
    public User this[int index]
    {
        get { return (base.List[index] as User); }
    }
    public void Remove(User value)
    {
        base.List.Remove(value as object);
    }
}
```

DEMO 10: Practical usage
------------------------

Fill options with AJAX:

*Client (javascript)*
```javascript
function GetCars()
{
    var cid = document.frmDemo.ddCompany[document.frmDemo.ddCompany.selectedIndex].value;
    if(!!cid)
    {
        // clear car list
        while(document.frmDemo.ddCar.options.length > 0) {
            document.frmDemo.ddCar.remove(0);
        }
        // add waiting element
        var option = document.createElement('option');
        document.frmDemo.ddCar.options.add(option);
        option.value = '';
        option.innerHTML = 'Loading...';
        // disable dropdown
        document.frmDemo.ddCar.disabled = true;
        // invoke
        var parameters = new SOAPClientParameters();
        parameters.add('companyid', cid);
        SOAPClient.invoke(url, 'GetCars', parameters, true, GetCars_callBack);
    }
}
function GetCars_callBack(cars)
{
    // clear car list
    var car = document.frmDemo.ddCar.options.length;
    while(document.frmDemo.ddCar.options.length > 0) {
        document.frmDemo.ddCar.remove(0);
    }
    // add first (empty) element
    var option = document.createElement('option');
    document.frmDemo.ddCar.options.add(option);
    option.value = '';
    option.innerHTML = 'Please, select a model...';                    
    // fill car list
    for(var i = 0; i < cars.length; i++)
    {
        var option = document.createElement('option');
        document.frmDemo.ddCar.options.add(o);
        option.value = cars[i].Id.toString();
        option.innerHTML = cars[i].Label;
    }
    // enable dropdown
    document.frmDemo.ddCar.disabled = false;
}
```javascript
*Server (WebMethod - C#)*
```csharp
public Car[] GetCars(string companyid)
{
    Car[] cl;
    switch (companyid.Trim().ToLower())
    {
        case "vw":
            cl = new Car[]
            {
                new Car(1, "Passat"),
                new Car(2, "Golf"),
                new Car(3, "Polo"),
                new Car(4, "Lupo")
            };
            break;
        case "f":
            cl = new Car[]
            {
                new Car(1, "Stilo"),
                new Car(2, "Punto"),
                new Car(3, "500")
            };
            break;
        case "bmw":
            cl = new Car[]
            {
                new Car(1, "X5"),
                new Car(2, "520")
            };
            break;
        default:
            cl = new Car[0];
            break;
    }
    return cl;
}
```
*Car class:*
```csharp
[Serializable]
public class Car
{
    private int _id = -1;
    private string _label = "";
    public Car() { }
    public Car(int id, string label)
    {
        this.Id = id;
        this.Label = label;
    }
    public int Id
    {
        get { return _id; }
        set { _id = value; }
    }
    public string Label
    {
        get { return _label; }
        set { _label = value; }
    }
}
```

DEMO 11: Using the SOAP response (xml)
--------------------------------------

How to use the SOAP response (XmlDocument) in callback method. In this example we show only the Xml in an alertbox, but you can - for example - transform the SOAP response using a stylesheet (XSL).

*Client (javascript)*
```javascript
function GetSoapResponse()
{
    var parameters = new SOAPClientParameters();
    SOAPClient.invoke(url, 'HelloWorld', parameters, true, GetSoapResponse_callBack);
}
function GetSoapResponse_callBack(response, soapResponse)
{
    if(soapResponse.xml) { // IE
        alert(soapResponse.xml);
    } else { // Firefox
        alert((new XMLSerializer()).serializeToString(soapResponse));
    }
}
```
*Server (WebMethod - C#)*
```csharp
public string HelloWorld()
{
    return "Hello World!";
}
```

DEMO 12: Using parameters (advanced)
------------------------------------

Passing complex parameters to the Web Service

*Client (javascript)*
```javascript
function User(id, username, password, expirationdate)
{
    this.Id = id;
    this.Username = username;
    this.Password = password;
    this.ExpirationDate = expirationdate;
}
function SendSamples_callBack(response)
{
    if(response typeof Error) {
        alert("An error has occured!\n\n" + response.description + "\n\n[Error code: " + response.number + ']');
    } else {
        alert(response);
    }
}
function SendSample1()
{
    var p1 = 'This is a string';
    var p2 = 34654;
    var p3 = 3.14159;
    var p4 = true;
    var p5 = new Date();
    var parameters = new SOAPClientParameters();
    parameters.add('p1', p1);
    parameters.add('p2', p2);
    parameters.add('p3', p3);
    parameters.add('p4', p4);
    parameters.add('p5', p5);
    SOAPClient.invoke(url, 'SendSample1', parameters, true, SendSamples_callBack);
}
function SendSample2()
{
    var list = new Array();
    list[0] = 'element 1';
    list[1] = 'element 2';
    list[2] = 'element 3';
    list[3] = 'element 4';
    var parameters = new SOAPClientParameters();
    parameters.add('list', list);
    SOAPClient.invoke(url, 'SendSample2', parameters, true, SendSamples_callBack);
}
function SendSample3()
{
    var list = new Array();
    list[0] = 235;
    list[1] = 9876;
    list[2] = 124;
    list[3] = 79865;
    list[4] = 53;
    var parameters = new SOAPClientParameters();
    parameters.add('list', list);
    SOAPClient.invoke(url, 'SendSample3', parameters, true, SendSamples_callBack);
}
function SendSample4a()
{
    var u = new User(34, 'Administrator', 'p@ss01!', new Date());     
    var parameters = new SOAPClientParameters();
    parameters.add('user', u);
    SOAPClient.invoke(url, 'SendSample4', parameters, true, SendSamples_callBack);
}
function SendSample4b()
{
    var u = new Object();
    u.Id = 5271;
    u.Username = 'Guest1';
    u.Password = 'GuestP@ss!';
    u.ExpirationDate = new Date();
    u.ExpirationDate.setMonth(u.ExpirationDate.getMonth() + 1);
    var parameters = new SOAPClientParameters();
    parameters.add('user', u);
    SOAPClient.invoke(url, 'SendSample4', parameters, true, SendSamples_callBack);
}
function SendSample4c()
{
    var u = new Array();
    u['Id'] = 654;
    u['Username'] = 'Guest2';
    u['Password'] = 'GuestP@ss!';
    u['ExpirationDate'] = new Date();
    u['ExpirationDate'].setMonth(u['ExpirationDate'].getMonth() + 1);
    var parameters = new SOAPClientParameters();
    parameters.add('user', u);
    SOAPClient.invoke(url, 'SendSample4', parameters, true, SendSamples_callBack);
}
function SendSample5()
{
    var ul = new Array();
    ul[0] = new User(52342, 'User1', 'User1P@ss!', new Date());
    ul[1] = new User(453, 'User2', 'User2P@ss!', new Date());
    ul[2] = new User(5756, 'User3', 'User3P@ss!', new Date());
    ul[3] = new User(5431, 'User4', 'User4P@ss!', new Date());
    var parameters = new SOAPClientParameters();
    parameters.add('userlist', ul);
    SOAPClient.invoke(url, 'SendSample5', parameters, true, SendSamples_callBack);
}
```
*Server (WebMethod - C#)*
```csharp
public string SendSample1(string p1, int p2, double p3, bool p4, DateTime p5)
{
    return
        "P1 - string = " + p1 + "\n" +
        "P2 - int = " + p2.ToString() + "\n" +
        "P3 - double = " + p3.ToString() + "\n" +
        "P4 - bool = " + p4.ToString() + "\n" +
        "P5 - DateTime = " + p5.ToString() + "";
}
public string SendSample2(string[] list)
{
    return
        "Length = " + list.Length.ToString() + "\n" +
        "First element = " + list[0] + "\n" +
        "Last element = " + list[list.Length - 1] + "";
}
public string SendSample3(int[] list)
{
    return
        "Length = " + list.Length.ToString() + "\n" +
        "First element = " + list[0].ToString() + "\n" +
        "Last element = " + list[list.Length - 1].ToString() + "";
}
public string SendSample4(User user)
{
    return
        "Id = " + user.Id.ToString() + "\n" +
        "Username = " + user.Username + "\n" +
        "Password = " + user.Password + "\n" +
        "ExpirationDate = " + user.ExpirationDate.ToString() + "";
}
public string SendSample5(User[] userlist)
{
    string s = "Length = " + userlist.Length.ToString() + "\n\n";
    for (int i = 0; i < userlist.Length; i++)
        s +=
            "Id = " + userlist[i].Id.ToString() + "\n" +
            "Username = " + userlist[i].Username + "\n" +
            "Password = " + userlist[i].Password + "\n" +
            "ExpirationDate = " + userlist[i].ExpirationDate.ToString() + "\n\n";
    return s;
}
```
