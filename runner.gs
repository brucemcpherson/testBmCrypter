// example specification with encryptions
const clone = {
  // create a new spreadsheet, cloning each of the masters, and encrypting the given columns

  id: '1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg',
  // will create any missing sheets (but the spreadsheet must exist)
  createIfMissing: true,
  // this method generates a new public key for the spreadsheet
  // this example will make a random one, but yu can make anything you want here
  generatePublicKey() {
    return bmCrypter.randomString()
  }

}


const runnerEncrypt = () => {
  Trackmyself.stamp()

  // create a new spreadsheet, cloning each of the masters, and encrypting the given columns
  const clone = {
    id: '1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg',
    // will create any missing sheets (but the spreadsheet must exist)
    createIfMissing: true,
    // this method generates a new public key for the spreadsheet
    // this example will make a random one, but yu can make anything you want here
    generatePublicKey() {
      return bmCrypter.randomString()
    }
  }

  // collect all these sheets, andencrypt the given columns
  const masters = [{
    id: '1cTRN6mGvH_vnWO2ehEFJkWi7Dpw9HcPNvg8zjrWKh4g',
    sheets: [{
      name: 'Billionaires',
      // wildcards are accepted so this just copies all columns
      copy: ['*'],
      // and encrypts these
      encrypt: ['Age', 'Billions'],
      // this generates a private key for each column - this generates a random one, but you can do what you like
      // for example use the same key for all columns
      // the params are for convenience in case you want some logic for key generation
      generatePrivateKey(masterId, sheetName, columnName) {
        return bmCrypter.randomString()
      },
      // if null rename the same as source
      get renameAs() {
        return 'encrypted-' + this.name
      }
    }]
  }]

  const settings = {
    masters,
    clone
  }

  const privateKeys = bmCrypter.newCrypter({
    settings
  }).exec()

  // these can be distributed to those with accesss
  console.log(JSON.stringify(privateKeys, null, '\t'))
}

const runnerPlain = () => {
  Trackmyself.stamp()
  const clone = {
    id: '1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg',
    // will create any missing sheets (but the spreadsheet must exist)
    createIfMissing: true,
    // this method generates a new public key for the spreadsheet
    // this example will make a random one, but yu can make anything you want here
    generatePublicKey() {
      return bmCrypter.randomString()
    }

  }
  const masters = [{
    id: '1cTRN6mGvH_vnWO2ehEFJkWi7Dpw9HcPNvg8zjrWKh4g',
    sheets: [{
      name: 'Billionaires',
      // wildcards are accepted so this just copies all columns
      copy: ['*'],
      // if null rename the same as source
      get renameAs() {
        return 'plain-' + this.name
      }
    }]
  },
  {
    id: '1vnwo8esaek0NPit1UgtERSobiYR5jCIP6dke5vsiPb8',
    sheets: [{
      name: 'caps',
      copy: ['Name', 'Cap Billions'],
      // if null rename the same as source
      get renameAs() {
        return 'caps-' + this.name
      }
    }]

  }]
  const settings = {
    masters,
    clone
  }
  bmCrypter.newCrypter({ settings }).exec()

}

// decrypter
const derunner = () => {
  Trackmyself.stamp()
  const settings = [
    {
      "id": "1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg",
      "sheetName": "encrypted-Billionaires",
      "columnName": "Billions",
      "privateKey": "aeffed1fc0c42a4a3f7a5c3e99f0c556c8cf2fc19981556a52bd120d625c0e4d"
    },
    {
      "id": "1lNLIpJwvz_GllYnloVBX02vOomZ68cP4Y2KZoPyi7Gg",
      "sheetName": "encrypted-Billionaires",
      "columnName": "Age",
      "privateKey": "57fbf42d9af8e69d9499c56f3883047a304c1b4b627d5e0798c5e23b99b9af49"
    }
  ]

  const fiddlers = bmCrypter.newDecrypter().exec({ settings, removeEncrypted: false })

  // now we can dump out these fiddlers with the decrypted values to the same or difference sheets
  fiddlers.forEach(fiddler => fiddler.dumpValues())

  // heres how we culd make new sheets for the decrypted
  bmCrypter.newDecrypter().exec({ settings, removeEncrypted: true })
    .forEach(fiddler => {
      // create a new sheet in the same spreadsheet
      bmPreFiddler.PreFiddler().getFiddler({
        id: fiddler.getSheet().getParent().getId(),
        sheetName: fiddler.getSheet().getName() + '-decrypted',
        createIfMissing: true
      }).setData(fiddler.getData()).dumpValues()
    })


}
const checkMeta = () => {
  console.log(getAllMeta(SpreadsheetApp.openById(clone.id)).unravels)
}
const getAllMeta = (spreadsheet) => {
  const meta = bmCrypter.CrypterMeta.getAllMetaData({ spreadsheet })
  return {
    meta,
    unravels: meta.map(f => bmCrypter.CrypterMeta.unravelMeta(f))
  }
}
