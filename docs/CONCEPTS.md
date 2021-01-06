# IVIS Concepts
IVIS framework has been designed around several concepts, namely:
 - for data visualization
    - workspace
    - panel
    - template
 - for data storage
    - signal set
    - signal
 - for data processing
    - job
    - task
 - for security management:
    - namespace

Collectively, they are called entities.

## Data visualization

### Workspace
A workspace is a top-level container which groups related panels. The framework provides UI elements to navigate to the workspace and to the panels it defines. The framework cannot display any data without a workspace with panels.
### Panel
A panel is an element that provides a particular view of the data in a particular workspace. Technically, a panel holds configuration parameters (if any) for an instance of a visualization template, which does the actual rendering. Each panels belongs to some workspace. A workspace without panels does not display anything. 
### Template
A template is the element of the visualization framework that does the actual rendering. A template defines how to display data with a particular structure.

## Data storage
Master data are kept in a MySQL database, but the framework mostly works only with data in a temporary storage provided by the ElasticSearch. IVIS framework uses concepts of signal set and signals to categorize data. 

### SignalSet (Sensor)
A signal set is a container which groups related signals together.

### Signals
A signal is an element representing a piece of information. For example, should we set up two sensors in an office, humidity sensor and temperature sensor, incoming data could be stored in one signal set with two signals, each representing data of one sensor.

## Data processing
IVIS framework utilizes concepts of tasks and jobs for additional data processing. With them it is possible to write custom programs to process existing data or gather additional data from other resources. The framework provides UI for coding and mechanism for running jobs when given conditions are met. Such conditions include:
- Periodic trigger - run job once every set period of time
- Signal set trigger - run if new data are added to selected signal set
- Minimal interval - on execution command job runs only if set interval has passed since the last run
- Delay - on execution command job waits given period of time before running

### Task
A task is the element containing code, files and definition of parameters. Each task has a type. Based on its type it is handled accordingly. For example two different types may have just different libraries available or they may use completely different programming languages. A task can't be run by itself. To run a task we need to create a Job.

### Job
A job holds configuration parameters for a task. There can be multiple jobs for the same task each with their own settings and parameters. A job can be run and we can set conditions, mentioned previously,  when it should happen automatically.

## Security management 
IVIS framework utilizes namespace concept along with sharing mechanism for security management. 

### Namespace
Namespace is a concept for management of security and access control. Each entity belongs to some namespace. Namespaces have hierarchical order that is used for access control.

### Sharing
 Each share is basically a triplet of user, entity and role. Role determines set of permissions allowed for that shared entity. Roles are defined in the yaml config file `default.yaml` under the key `roles`.  
 ```yaml
 roles:
   global:
     master:
       name: "Master"
       admin: true
       description: "All permissions"
       permissions:
       - rebuildPermissions
       - manageSettings
       rootNamespaceRole: master
 
   namespace:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "share", "createNamespace", "createTemplate", "createJob", "createTask", "createWorkspace", "createPanel", "createSignal", "createSignalSet", "manageUsers"]
       children:
         namespace: ["view", "edit", "delete", "share", "createNamespace", "createTemplate", "createJob", "createTask", "createWorkspace", "createPanel", "createSignal", "createSignalSet", "manageUsers"]
         template: ["view", "edit", "delete", "share", "execute", "viewFiles", "manageFiles"]
         job: ["view", "edit", "delete", "share", "execute", "viewFiles", "manageFiles"]
         task: ["view", "edit", "delete", "share", "execute", "viewFiles", "manageFiles"]
         workspace: ["view", "edit", "delete", "share", "createPanel"]
         panel: ["view", "edit", "delete", "share"]
         signal: ["view", "edit", "delete", "query", "share"]
         signalSet: ["view", "edit", "delete", "insertRecord", "editRecord", "deleteRecord", "query", "share", "reindex", "createSignal", "manageScripts"]
 
   template:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "share", "execute", "viewFiles", "manageFiles"]
 
   job:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "share", "execute", "viewFiles", "manageFiles"]
 
   task:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "share", "execute", "viewFiles", "manageFiles"]
 
   workspace:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "share", "createPanel"]
 
   panel:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "share"]
 
   signal:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "query", "share"]
 
   signalSet:
     master:
       name: "Master"
       description: "All permissions"
       permissions: ["view", "edit", "delete", "insertRecord", "editRecord", "deleteRecord", "query", "share", "reindex", "createSignal", "manageScripts"]
 ```
Under `roles` are all the entities and a special key `global`. For each of those we can define permissions under role's name, here are all roles named `master`.
 
Under `roles.global` are defined roles not connected to any particular entity that can be assigned directly to a user. Here we have some special possibilities for a role definition:
- `admin` if true user has all permissions in the Root namespace by default
- `rootNamespaceRole` sets user's role in the Root namespace
- `ownNamespaceRole` sets user's role in his own namespace

Permissions for given role and entity are therefore defined here on the path `roles -> entity type -> role's name -> permissions`, e.g. `roles.panel.master.permissions`. What permission names are available is not strictly defined. Extensions of the framework may create new permissions as they need. Developers decide what functionality should be available under what permission and those permissions can be then assigned to the roles as needed.

For namespace we can also define permissions for entities in it and its subtree. Meaning if the namespace is shared under a role with defined `children` with a user, that user also receives permissions defined here on all the entities in the namespace and namespaces in the subtree. Definition are under `children` key, e.g. `roles.namespace.master.children`. There we use entity type as a key and define set of allowed permissions.


## IVIS for developers
This section describes the task API for communication with IVIS core.

### Primary attributes 
Each job once stared receives attributes in json format on the standard input, file descriptor 0. Example of data:
```json
{
  "params": {
    "sigSet": "example_set",
    "ts_signal": "ts",
    "source_signal": "source"
  },
  "entities": {
    "signalSets": {
      "example_set": {
        "index": "signal_set_1",
        "name": "Example set",
        "namespace": 1
      }
    },
    "signals": {
      "example_set": {
        "source": {
          "field": "s1",
          "name": "Source of values",
          "namespace": 1
        },
        "ts": {
          "field": "s2",
          "name": "Timestamp",
          "namespace": 1
        }
      }
    }
  },
  "state": {
    "created_set": {
      "index": "signal_set_2",
      "type": "_doc",
      "fields": {
        "created_signal": "s3"
      }
    }
  },
  "es": {
    "host": "localhost",
    "port": "9200"
  }
}
```
There are 4 main JSON objects in incoming data: 
- `params`
- `entities`
- `state`
- `es`

`params` are parameters from the job being run that were set previously in GUI of the job's settings page. It is always a pair of parameter's identifier and selected value.
 
`entities` have 2 JSON objects, `signalSets` and `signals`. Each signal set found in the parameters of the job is listed in the `signalSets` under his CID with 3 properties, `index`, that is corresponding index in the ElasticSearch, `name` and `namespace`. Each signal found in the parameters is listed in the `signals` object under CID of the signal set it belongs to under its CID with 3 properties, `field`, that is field in ElasticSearch in the index of its signal set, `name` and `namespace`.

`state` is job's state stored in the ElasticSearch. Content of `state` depends completely on what is stored there in the job's code. More on that later. 

`es` contains information about ElasticSearch instance. Under `host` is host's address and under `port` is port it is listening on.

### Job requests
Job can send request to the IVIS core. Requests are accepted on the file descriptor 3 in JSON format and answer is received on the standard input.  There are 2 types of requests job can send:
- `store_state` 
- `create_signals`

`store_state` will request storing given state. This state is received on each run start in `state` object mentioned previously. `create_signals` will request creating new signal set and signals.
Example of a `store_state` request:
 ```json
{
  "id": 1,
  "type": "store_state",
  "state": {
    "index": "signal_set_2",
    "type": "_doc",
    "fields": {
      "created_signal": "s3"
    }
  }
}
```
and received answer:
```json
{
  "id": 1
}
```
Each request has `type`, either `store_state` or `create_signals`, that determines requested action. If there is `id` present in the request it will be copied to the answer unless the JSON format was incorrect. If there is no `error` present, request succeeded. Otherwise `error` with error message will be present in the answer:
```json
{
  "id": 1,
  "error": "Request failed"
}
```
In the `store_state` request everything in `state` object will be stored.

`create_signals` request looks like this:
```json
{
  "type": "create_signals",
  "signalSets": {
      "cid" : "created_set",
      "name" : "Example set" ,
      "namespace": 1,
      "description" : "Documentation example signal set" ,
      "signals": [
        {
          "cid": "created_signal",
          "name": "Example signal",
          "description": "Documentation example signal set",
          "namespace": 1,
          "type": "text",
          "indexed": false,
          "settings": {} 
        }       
      ]
  }
}
```
and received answer:
```json
{
  "created_set": {
    "index": "signal_set_2",
    "type": "_doc",
    "fields": {
      "created_signal": "s3"
     }
  }
}
```
It is possible to request multiple signal sets at once:
```json
{
  "type": "create_signals",
  "signalSets": [
    {
      "cid" : "created_set1",
      "namespace": 1,
      "signals": [
      ]
    },
    {
      "cid" : "created_set2",
      "namespace": 1,
      "signals": [
      ]
    }
  ]
}
```
answer:
```json
{
  "created_set1": {
    "index": "signal_set_23",
    "type": "_doc",
    "fields": {
     }
  },
  "created_set2": {
    "index": "signal_set_24",
    "type": "_doc",
    "fields": {
     }
  }
}
```

It is also possible to request creation of signals in an existing signal set:
```json
{
  "type": "create_signals",
  "signals": {
    "existing_signal_set_cid": [
      {
        "cid": "created_signal",
        "name": "Example signal",
        "description": "Documentation example signal set",
        "namespace": 1,
        "type": "text",
        "indexed": false,
        "settings": {} 
      }   
    ]   
  }
}
```
answer:
```json
{
  "existing_signal_set_cid": {
    "index": "signal_set_16",
    "type": "_doc",
    "fields": {
      "created_signal": "s25"
     }
  }
}
```
## IVIS Extension for Domain-Specific Applications
IVIS-CORE can be extended thourgh IVIS extensions mechanism, and plug-ins in order to develop Domain-Specific Applications. For that, we need to create another project in another repository for the Domain-Specific Application, where we include the core as a git submodule and add domain-specific modules, and components, import/management components and possibly some branding.
