var config = {};
config.nav = [
	{
		name:'manage', 
		pages:[
			{ name: 'load', permissions: ['ManageWorkflow'] },
            { name: 'map', permissions: ['ManageWorkflow'] },
            { name: 'aggregate', permissions: ['ManageWorkflow'] },
            { name: 'schedule', permissions: ['ViewWorkflowSchedule'] },
			{ name: 'expiration', permissions: ['ViewDataExpiration'] }
		]
	},
	{
		name:'monitor',
		pages: [
			{ name: 'workflow', permissions: ['ViewMonitor'] },
            { name: 'data', permissions: ['ViewDataQualityRules'] },
            { name: 'alerts', permissions: ['ViewAlerts'] }
		]
	},
	{
	    name: 'browse',
	    pages: [
			{ name: 'lineage', permissions: ['ViewLineage'] },
            { name: 'log', permissions: ['ViewEventLog'] }
	    ]
	},
	{
	    name: 'analyze',
	    pages: [
			{ name: 'past', permissions: ['ViewAnalyze'] },
			{ name: 'now', permissions: ['ViewAnalyze'] },
			{ name: 'predict', permissions: ['ViewAnalyze'] }
	    ]
	},
    {
        name: 'admin',
        pages: [
            { name: 'activity', permissions: ['ViewActivity'] },
            { name: 'notifications', permissions: ['ViewNotifications'] },
            { name: 'users', permissions: ['ViewUsers'] },
            { name: 'object locks', permissions: ['ViewObjectLocks'] }
        ]
    }

];

config.apis = {
	test:{url:'./api_tests/test.json'}
}
