/**
 * before you can do this you need to enable the Apps Script API
 * you can either assign an existing cloud project to it, or grab this error link
 * message: 'Apps Script API has not been used in project 304737360224 before or it is disabled.
 * Enable it by visiting https://console.developers.google.com/apis/api/script.googleapis.com/overview?project=304737360224 then retry. If you enabled this API recently, wait a few minutes for the action to propagate to our systems and retry.'
 */
const cloneProject = () => {
  // get a sapi instance
  const sapi = bmImportScript.newScriptApi({
    tokenService: ScriptApp.getOAuthToken,
    fetcher: UrlFetchApp.fetch,
  })

  // get the project we'll clone
  const sourceProject = sapi.getProject({scriptId:'1Byrtnr_uuAt3BiZ6_qh6T8vBZq-YdgnDaqoJ64Ss7kM4q2XE-XGPcmCi' })
  console.log(sourceProject)
  if (!sourceProject.success) {
    throw sourceProject.extended
  }

  // and its source - including its manifest
  const source = sapi.getProjectContent({
    scriptId: sourceProject.data.scriptId
  })
  if (!source.success) throw source.extended

  // create a new project/ using the title of the source project
  const project = sapi.createProject({ title: `clone of ${sourceProject.data.title}`})
  if (!project.success) throw project.extended
  console.log(`Created ${project.data.scriptId} (${project.data.title})`)

  // add content from the source project, including its manifest - so we'll use replace for collisions
  const content = sapi.addFiles({
    scriptId: project.data.scriptId,
    files: source.data.files,
    collision: 'replace'
  })
  if (!content.success) throw content.extended

  console.log(`cloned ${source.data.files.length} files from ${sourceProject.data.title} to ${project.data.title}`)

}

const cloneContainerProject = () => {
  
  // get a sapi instance
  const sapi = bmImportScript.newScriptApi({
    tokenService: ScriptApp.getOAuthToken,
    fetcher: UrlFetchApp.fetch
  })

  // get the project we'll clone
  const sourceProject = sapi.getProject({scriptId:'1Byrtnr_uuAt3BiZ6_qh6T8vBZq-YdgnDaqoJ64Ss7kM4q2XE-XGPcmCi' })
  if (!sourceProject.success) throw sourceProject.extended

  // and its source - including its manifest
  const source = sapi.getProjectContent({
    scriptId: sourceProject.data.scriptId
  })
  if (!source.success) throw source.extended

  // create a new project/ using the title of the source project
  const project = sapi.createProject({ 
    title: `container clone of ${sourceProject.data.title}`,
    parentId: '1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg'
  })
  if (!project.success) throw project.extended
  console.log(`Created ${project.data.scriptId} (${project.data.title})`)

  // add content from the source project, including its manifest - so we'll use replace for collisions
  const content = sapi.addFiles({
    scriptId: project.data.scriptId,
    files: source.data.files,
    collision: 'replace'
  })
  if (!content.success) throw content.extended

  console.log(`cloned ${source.data.files.length} files from ${sourceProject.data.title} to ${project.data.title}`)

}

const cloneContainerProjectFiddle = () => {
  
  // this example takes the code of an addon/converts it to a menu item in a container bound file
  // and adds a couple oauth scopes to the manifest

  // get a sapi instance
  const sapi = bmImportScript.newScriptApi({
    tokenService: ScriptApp.getOAuthToken,
    fetcher: UrlFetchApp.fetch,
    // we don't really need cache here so i won't bother
    cacheStore: null
  })

  // get the project we'll clone
  const sourceProject = sapi.getProject({scriptId:'1Byrtnr_uuAt3BiZ6_qh6T8vBZq-YdgnDaqoJ64Ss7kM4q2XE-XGPcmCi' })
  if (!sourceProject.success) throw sourceProject.extended

  // and its source - including its manifest
  const source = sapi.getProjectContent({
    scriptId: sourceProject.data.scriptId
  })
  if (!source.success) throw source.extended

  // create a new project/ using the title of the source project
  const project = sapi.createProject({ 
    title: `container clone of ${sourceProject.data.title}`,
    parentId: '1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg'
  })
  if (!project.success) throw project.extended
  console.log(`Created ${project.data.scriptId} (${project.data.title})`)

  // now we need to play with the manifest file to add a couple of scopes and dedup incase they are there already
  const manifest = source.data.files.find(f=>sapi.isManifest(f))
  if (!manifest) throw new Error('Couldnt find manifest file')
  const parsedManifest = JSON.parse(manifest.source)
  parsedManifest.oauthScopes = (parsedManifest.oauthScopes || [])
    .concat([
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/script.container.ui"
    ])
    .filter((f,i,a)=>a.indexOf(f)===i)
  // push that back
  manifest.source = JSON.stringify(parsedManifest)


  // add content from the source project, including its manifest - so we'll use replace for collisions
  const content = sapi.addFiles({
    scriptId: project.data.scriptId,
    files: source.data.files,
    collision: 'replace'
  })
  if (!content.success) throw content.extended

  console.log(`cloned ${source.data.files.length} files from ${sourceProject.data.title} to ${project.data.title}`)

}

const mergeSelectedFiles = () => {
  // get a sapi instance
  const sapi = bmImportScript.newScriptApi({
    tokenService: ScriptApp.getOAuthToken,
    fetcher: UrlFetchApp.fetch,
    cacheStore: CacheService.getUserCache(),
  })
  const SOURCE_ID = '1LKm0bAC7d7KRD958B2B4bcjJ4o1sCwYZAu95s_vV0zSWy0A37BVGIUJH'
  const TARGET_ID = '1VnWXCYlxxlg7AAk0YgMAvx2Fy-7RJuq2JJCvA-1obHRD6s_nCUTwClxT'

  // get the files from the source project
  // and its source - including its manifest
  const source = sapi.getProjectContent({
    scriptId: SOURCE_ID,
    noCache: true
  })
  if (!source.success) throw source.extended

  // we're going to merge the manifests here so that they get any dependencies and oauths requried
  const target = sapi.getProjectContent({
    scriptId: TARGET_ID,
    noCache: true
  })
  if (!target.success) throw source.extended
  
  // get the manifs
  const sourceManifest = source.data.files.find(f=>sapi.isManifest(f))
  const targetManifest = target.data.files.find(f=>sapi.isManifest(f))
  const ps = JSON.parse(sourceManifest.source)
  const pt = JSON.parse(targetManifest.source)

  // add the oauth scopes from the source
  pt.oauthScopes = (pt.oauthScopes || [])
    .concat(ps.oauthScopes || [])
    .filter((f,i,a)=>a.indexOf(f)===i)

  // add any library dependencies
  pt.dependencies = pt.dependencies || {}
  pt.dependencies.libraries = (pt.dependencies.libraries || [])
    .concat((ps.dependencies && ps.dependencies.libraries) || [])
    .filter((f,i,a)=>a.findIndex(({libraryId})=>libraryId===f.libraryId)===i)

  // just put that all back
  targetManifest.source = JSON.stringify(pt)
 
  // we only want one of the source files
  const sourceFiles = source.data.files.filter(f=>f.name === "Examples" && f.type === "SERVER_JS")

  console.log(sourceFiles, targetManifest)

  
  // we can now write all that back - important that we replace so the updated manifest gets popped in
  sapi.addFiles({
    scriptId: TARGET_ID,
    files:sourceFiles.concat([targetManifest]),
    collision: 'replace'
  })

}
